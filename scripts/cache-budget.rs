//! Bound only regenerable Next.js runtime caches. Defaults to a dry run.
//! rustc -O scripts/cache-budget.rs -o /usr/local/sbin/guidebook-cache-budget
use std::os::unix::fs::MetadataExt;
use std::{
    collections::BTreeMap,
    env, fs, io,
    path::{Component, Path, PathBuf},
    time::{Duration, SystemTime, UNIX_EPOCH},
};

const MIB: u64 = 1024 * 1024;
#[derive(Clone, Copy)]
struct Policy {
    high: u64,
    low: u64,
    entries: usize,
    age: Duration,
    quiet: Duration,
}
struct File {
    path: PathBuf,
    size: u64,
    modified: SystemTime,
    inode: u64,
}
#[derive(Default)]
struct Entry {
    files: Vec<File>,
    size: u64,
    used: u64,
    changed: u64,
}
#[derive(Debug, Default)]
struct Report {
    before: u64,
    after: u64,
    entries: usize,
    removed: usize,
    busy: usize,
}

fn seconds(time: SystemTime) -> u64 {
    time.duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}
fn key(relative: &Path, grouped: bool) -> PathBuf {
    if !grouped {
        return relative.to_owned();
    }
    let mut prefix = PathBuf::new();
    for part in relative.components() {
        if let Component::Normal(name) = part {
            let text = name.to_string_lossy();
            if let Some(base) = text.strip_suffix(".segments") {
                return prefix.join(base);
            }
            prefix.push(name);
        }
    }
    let text = prefix.to_string_lossy();
    for suffix in [".html", ".meta", ".rsc", ".body", ".json"] {
        if let Some(base) = text.strip_suffix(suffix) {
            return PathBuf::from(base);
        }
    }
    prefix
}
fn collect(
    root: &Path,
    directory: &Path,
    grouped: bool,
    entries: &mut BTreeMap<PathBuf, Entry>,
) -> io::Result<()> {
    let children = match fs::read_dir(directory) {
        Ok(children) => children,
        Err(error) if error.kind() == io::ErrorKind::NotFound => return Ok(()),
        Err(error) => return Err(error),
    };
    for child in children {
        let path = child?.path();
        let meta = match fs::symlink_metadata(&path) {
            Ok(meta) => meta,
            Err(error) if error.kind() == io::ErrorKind::NotFound => continue,
            Err(error) => return Err(error),
        };
        if meta.is_symlink() {
            return Err(io::Error::other(format!(
                "refusing cache symlink: {}",
                path.display()
            )));
        }
        if meta.is_dir() {
            collect(root, &path, grouped, entries)?;
        } else if meta.is_file() {
            let entry = entries
                .entry(key(path.strip_prefix(root).unwrap(), grouped))
                .or_default();
            let modified = meta.modified()?;
            // Allocated blocks account for the many small .meta/segment files.
            let size = meta.blocks().saturating_mul(512);
            entry.size += size;
            entry.used = entry
                .used
                .max(meta.atime().max(0) as u64)
                .max(seconds(modified));
            entry.changed = entry.changed.max(seconds(modified));
            entry.files.push(File {
                path,
                size,
                modified,
                inode: meta.ino(),
            });
        }
    }
    Ok(())
}
fn unchanged(entry: &Entry) -> bool {
    entry.files.iter().all(|file| {
        fs::symlink_metadata(&file.path).is_ok_and(|meta| {
            meta.is_file()
                && !meta.is_symlink()
                && meta.ino() == file.inode
                && meta.modified().ok() == Some(file.modified)
        })
    })
}
fn trim(root: &Path, grouped: bool, policy: Policy, apply: bool) -> io::Result<Report> {
    if !root.try_exists()? {
        return Ok(Report::default());
    }
    if fs::symlink_metadata(root)?.is_symlink() || root.canonicalize()? != root {
        return Err(io::Error::other(
            "cache path must be a real directory without symlink components",
        ));
    }
    let mut entries = BTreeMap::new();
    collect(root, root, grouped, &mut entries)?;
    let mut entries: Vec<_> = entries.into_values().collect();
    entries.sort_by_key(|entry| entry.used);
    let before = entries.iter().map(|entry| entry.size).sum();
    let mut report = Report {
        before,
        after: before,
        entries: entries.len(),
        ..Report::default()
    };
    let pressure = before > policy.high || entries.len() > policy.entries;
    let now = seconds(SystemTime::now());
    for entry in entries {
        let expired = now.saturating_sub(entry.used) > policy.age.as_secs();
        let over = pressure && (report.after > policy.low || report.entries > policy.entries);
        if !expired && !over {
            continue;
        }
        if now.saturating_sub(entry.changed) < policy.quiet.as_secs() || !unchanged(&entry) {
            report.busy += 1;
            continue;
        }
        if apply {
            // Entries include HTML/RSC/meta/segments together. Removing the
            // primary first makes a concurrent read a cache miss, not a mixed response.
            let mut files = entry.files;
            files.sort_by_key(|file| {
                if matches!(
                    file.path.extension().and_then(|s| s.to_str()),
                    Some("html" | "body")
                ) {
                    0
                } else {
                    1
                }
            });
            for file in files {
                // A refreshed sibling is left alone; Next will regenerate a miss.
                let meta = match fs::symlink_metadata(&file.path) {
                    Ok(meta) => meta,
                    Err(error) if error.kind() == io::ErrorKind::NotFound => continue,
                    Err(error) => return Err(error),
                };
                if !meta.is_file() || meta.ino() != file.inode || meta.modified()? != file.modified
                {
                    continue;
                }
                match fs::remove_file(&file.path) {
                    Ok(()) => (),
                    Err(error) if error.kind() == io::ErrorKind::NotFound => (),
                    Err(error) => return Err(error),
                }
                report.after = report.after.saturating_sub(file.size);
                let mut parent = file.path.parent();
                while let Some(directory) =
                    parent.filter(|path| *path != root && path.starts_with(root))
                {
                    // Empty cache directories also consume disk blocks. Stop as
                    // soon as an active sibling prevents removing its directory.
                    if fs::remove_dir(directory).is_err() {
                        break;
                    }
                    parent = directory.parent();
                }
            }
        } else {
            report.after = report.after.saturating_sub(entry.size);
        }
        report.entries = report.entries.saturating_sub(1);
        report.removed += 1;
    }
    Ok(report)
}
fn main() -> io::Result<()> {
    let args: Vec<_> = env::args().skip(1).collect();
    if args.is_empty() || args.len() > 2 || (args.len() == 2 && args[1] != "--apply") {
        return Err(io::Error::other(
            "Usage: cache-budget RELEASE_DIRECTORY [--apply] (otherwise dry run)",
        ));
    }
    let root = fs::canonicalize(&args[0])?;
    let build = root.join(".next-build");
    if build.canonicalize()? != build || !build.join("BUILD_ID").is_file() {
        return Err(io::Error::other(
            "expected an actual .next-build directory with BUILD_ID",
        ));
    }
    let apply = args.len() == 2;
    for (path, high, low, max, days, grouped) in [
        ("server/route-cache", 768, 512, 6000, 3, true),
        ("cache/fetch-cache", 128, 96, 4096, 1, false),
        ("cache/images", 256, 192, 4096, 7, false),
    ] {
        let report = trim(
            &build.join(path),
            grouped,
            Policy {
                high: high * MIB,
                low: low * MIB,
                entries: max,
                age: Duration::from_secs(days * 86400),
                quiet: Duration::from_secs(60),
            },
            apply,
        )?;
        println!("{} {} before_bytes={} after_bytes={} remaining_entries={} removed_entries={} busy_entries={}",
            if apply { "applied" } else { "dry-run" }, path, report.before, report.after, report.entries, report.removed, report.busy);
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::os::unix::fs::symlink;
    fn fixture(name: &str) -> PathBuf {
        let path =
            env::temp_dir().join(format!("cache-budget-test-{}-{}", std::process::id(), name));
        fs::create_dir_all(&path).unwrap();
        path
    }
    fn policy() -> Policy {
        Policy {
            high: 1,
            low: 0,
            entries: 1,
            age: Duration::from_secs(86400),
            quiet: Duration::ZERO,
        }
    }
    #[test]
    fn groups_complete_route_entries() {
        assert_eq!(
            key(Path::new("APP_PAGE/hash/$/en/place.html"), true),
            Path::new("APP_PAGE/hash/$/en/place")
        );
        assert_eq!(
            key(
                Path::new("APP_PAGE/hash/$/en/place.segments/a.segment.rsc"),
                true
            ),
            Path::new("APP_PAGE/hash/$/en/place")
        );
    }
    #[test]
    fn dry_run_preserves_files_and_apply_removes_group_only() {
        let root = fixture("group");
        fs::create_dir_all(root.join("place.segments")).unwrap();
        for file in [
            "place.html",
            "place.meta",
            "place.rsc",
            "place.segments/a.segment.rsc",
        ] {
            fs::write(root.join(file), b"payload").unwrap();
        }
        let dry = trim(&root, true, policy(), false).unwrap();
        assert_eq!(dry.removed, 1);
        assert!(root.join("place.html").exists());
        let applied = trim(&root, true, policy(), true).unwrap();
        assert_eq!(applied.after, 0);
        assert_eq!(applied.removed, 1);
        assert!(!root.join("place.meta").exists());
        assert!(!root.join("place.segments/a.segment.rsc").exists());
        fs::remove_dir_all(root).unwrap();
    }
    #[test]
    fn rejects_symlinks_without_touching_target() {
        let root = fixture("symlink");
        let outside = fixture("outside");
        fs::write(outside.join("keep"), b"important").unwrap();
        symlink(&outside, root.join("link")).unwrap();
        assert!(trim(&root, true, policy(), true).is_err());
        assert!(outside.join("keep").exists());
        fs::remove_dir_all(root).unwrap();
        fs::remove_dir_all(outside).unwrap();
    }
    #[test]
    fn retains_active_writes_and_ignores_immutable_build_files() {
        let root = fixture("active");
        fs::write(root.join("page.html"), b"active").unwrap();
        let mut rules = policy();
        rules.quiet = Duration::from_secs(60);
        let report = trim(&root, true, rules, true).unwrap();
        assert_eq!(report.busy, 1);
        assert!(root.join("page.html").exists());
        fs::remove_dir_all(root).unwrap();
    }

    fn age(path: &Path, seconds: u64) {
        let time = SystemTime::now() - Duration::from_secs(seconds);
        fs::File::open(path)
            .unwrap()
            .set_times(fs::FileTimes::new().set_accessed(time).set_modified(time))
            .unwrap();
    }

    #[test]
    fn keeps_recent_entries_under_budget_and_evicts_the_oldest_first() {
        let root = fixture("lru");
        fs::write(root.join("old.html"), b"old").unwrap();
        fs::write(root.join("new.html"), b"new").unwrap();
        age(&root.join("old.html"), 20);
        age(&root.join("new.html"), 10);
        let mut rules = policy();
        let allocated = fs::metadata(root.join("old.html")).unwrap().blocks() * 512;
        rules.high = allocated * 3;
        rules.low = allocated * 2;
        rules.entries = 2;
        assert_eq!(trim(&root, true, rules, true).unwrap().removed, 0);
        rules.high = allocated;
        rules.low = allocated;
        assert_eq!(trim(&root, true, rules, true).unwrap().removed, 1);
        assert!(!root.join("old.html").exists());
        assert!(root.join("new.html").exists());
        fs::remove_dir_all(root).unwrap();
    }

    #[test]
    fn expires_stale_entries_even_under_budget() {
        let root = fixture("expiry");
        fs::write(root.join("old.body"), b"stale").unwrap();
        age(&root.join("old.body"), 172800);
        let mut rules = policy();
        rules.high = u64::MAX;
        rules.low = u64::MAX;
        assert_eq!(trim(&root, true, rules, true).unwrap().removed, 1);
        fs::remove_dir_all(root).unwrap();
    }

    #[test]
    fn detects_a_refresh_after_the_scan() {
        let root = fixture("refresh");
        let path = root.join("page.html");
        fs::write(&path, b"old").unwrap();
        age(&path, 20);
        let mut entries = BTreeMap::new();
        collect(&root, &root, true, &mut entries).unwrap();
        fs::write(&path, b"new response").unwrap();
        assert!(!unchanged(entries.values().next().unwrap()));
        fs::remove_dir_all(root).unwrap();
    }
}

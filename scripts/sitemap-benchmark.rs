// Single local HTTP request: CPU ticks, total bytes and peak RSS of the server.
// rustc scripts/sitemap-benchmark.rs -o /tmp/sitemap-benchmark
// /tmp/sitemap-benchmark NODE_PID PORT /sitemap.xml
use std::{
    env, fs,
    io::{Read, Write},
    net::TcpStream,
    process::Command,
    time::{Duration, Instant},
};
fn cpu(pid: &str) -> u64 {
    let stat = fs::read_to_string(format!("/proc/{pid}/stat")).unwrap();
    let fields: Vec<_> = stat
        .rsplit_once(") ")
        .unwrap()
        .1
        .split_whitespace()
        .collect();
    fields[11].parse::<u64>().unwrap() + fields[12].parse::<u64>().unwrap()
}
fn main() {
    let args: Vec<_> = env::args().collect();
    let (pid, port) = (&args[1], &args[2]);
    let paths = &args[3..];
    assert!(!paths.is_empty());
    assert!(paths
        .iter()
        .all(|path| path.starts_with('/') && !path.contains(['\r', '\n'])));
    let hz: f64 = String::from_utf8(
        Command::new("getconf")
            .arg("CLK_TCK")
            .output()
            .unwrap()
            .stdout,
    )
    .unwrap()
    .trim()
    .parse()
    .unwrap();
    let before = cpu(pid);
    let start = Instant::now();
    let mut bytes = 0;
    for path in paths {
        let mut socket = TcpStream::connect(format!("127.0.0.1:{port}")).unwrap();
        socket
            .set_read_timeout(Some(Duration::from_secs(30)))
            .unwrap();
        write!(
            socket,
            "GET {path} HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n"
        )
        .unwrap();
        let mut buffer = [0; 16384];
        let mut first = true;
        loop {
            let count = socket.read(&mut buffer).unwrap();
            if count == 0 {
                break;
            }
            if first {
                assert!(buffer[..count].starts_with(b"HTTP/1.1 200"));
                first = false;
            }
            bytes += count;
        }
    }
    let status = fs::read_to_string(format!("/proc/{pid}/status")).unwrap();
    println!(
        "{} requests: bytes={bytes} CPU_ms={:.0} wall_ms={} {} {}",
        paths.len(),
        (cpu(pid) - before) as f64 / hz * 1000.,
        start.elapsed().as_millis(),
        status.lines().find(|s| s.starts_with("VmRSS:")).unwrap(),
        status.lines().find(|s| s.starts_with("VmHWM:")).unwrap()
    );
}

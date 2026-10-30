// rustc scripts/admin-benchmark.rs -o /tmp/admin-benchmark
// /tmp/admin-benchmark PID [PORT] -- local production process, no credentials.
use std::{env, fs, io::{Read, Write}, net::TcpStream, time::Instant};
fn cpu(pid: &str) -> u64 {
    let stat = fs::read_to_string(format!("/proc/{pid}/stat")).unwrap();
    let fields: Vec<_> = stat.rsplit_once(") ").unwrap().1.split_whitespace().collect();
    fields[11].parse::<u64>().unwrap() + fields[12].parse::<u64>().unwrap()
}
fn request(port: &str) {
    let mut socket = TcpStream::connect(format!("127.0.0.1:{port}")).unwrap();
    socket.set_read_timeout(Some(std::time::Duration::from_secs(20))).unwrap();
    socket.write_all(b"GET /login HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n").unwrap();
    let mut response = Vec::new(); socket.read_to_end(&mut response).unwrap();
    assert!(response.starts_with(b"HTTP/1.1 200"));
}
fn main() {
    let args: Vec<_> = env::args().collect();
    let pid = &args[1]; let port = args.get(2).map(String::as_str).unwrap_or("3218");
    for _ in 0..5 { request(port); }
    let ticks = std::process::Command::new("getconf").arg("CLK_TCK").output().unwrap();
    let hz: f64 = String::from_utf8(ticks.stdout).unwrap().trim().parse().unwrap();
    let before = cpu(pid); let start = Instant::now();
    for _ in 0..50 { request(port); }
    let elapsed = start.elapsed().as_secs_f64();
    let cpu_ms = (cpu(pid) - before) as f64 / hz * 1000.;
    let status = fs::read_to_string(format!("/proc/{pid}/status")).unwrap();
    let rss = status.lines().find(|line| line.starts_with("VmRSS:")).unwrap();
    println!("50 warm GET /login: CPU {cpu_ms:.0} ms; wall {:.0} ms; {rss}", elapsed * 1000.);
}

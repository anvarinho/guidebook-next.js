// rustc scripts/admin-workload-benchmark.rs -o /tmp/admin-workload-benchmark
// Usage: NODE_PID MONGO_PID COOKIE_FILE [PORT]. Isolated local fixtures only.
use std::{env,fs,io::{Read,Write},net::TcpStream,time::Instant};
fn cpu(pid:&str)->u64 {
    let stat=fs::read_to_string(format!("/proc/{pid}/stat")).unwrap();
    let fields:Vec<_>=stat.rsplit_once(") ").unwrap().1.split_whitespace().collect();
    fields[11].parse::<u64>().unwrap()+fields[12].parse::<u64>().unwrap()
}
fn rss(pid:&str)->String {
    fs::read_to_string(format!("/proc/{pid}/status")).unwrap().lines()
        .find(|s|s.starts_with("VmRSS:")).unwrap().trim().to_owned()
}
fn request(port:&str,path:&str,cookie:&str) {
    let mut socket=TcpStream::connect(format!("127.0.0.1:{port}")).unwrap();
    socket.set_read_timeout(Some(std::time::Duration::from_secs(30))).unwrap();
    write!(socket,"GET {path} HTTP/1.1\r\nHost: 127.0.0.1:{port}\r\nCookie: {}\r\nConnection: close\r\n\r\n",cookie.trim()).unwrap();
    let mut response=Vec::new();socket.read_to_end(&mut response).unwrap();
    assert!(response.starts_with(b"HTTP/1.1 200"),"request must be authenticated and succeed");
}
fn main(){
    let args:Vec<_>=env::args().collect();let node=&args[1];let mongo=&args[2];
    let cookie=fs::read_to_string(&args[3]).unwrap();let port=args.get(4).map(String::as_str).unwrap_or("3218");
    let ticks=std::process::Command::new("getconf").arg("CLK_TCK").output().unwrap();
    let hz:f64=String::from_utf8(ticks.stdout).unwrap().trim().parse().unwrap();
    for path in ["/admin","/admin/places?sort=views","/admin/reports"]{
        for _ in 0..5{request(port,path,&cookie)}
        let n=cpu(node);let m=cpu(mongo);let start=Instant::now();
        for _ in 0..20{request(port,path,&cookie)}
        println!("{path}: 20 requests; Node CPU {:.0}ms; Mongo CPU {:.0}ms; wall {:.0}ms; Node {}; Mongo {}",
            (cpu(node)-n)as f64/hz*1000.,(cpu(mongo)-m)as f64/hz*1000.,start.elapsed().as_secs_f64()*1000.,rss(node),rss(mongo));
    }
}

// Test-only content service: no database, credentials, or external network.
// rustc tests/fixtures/content-server.rs -o /tmp/guidebook-content-fixture
use std::io::{Read, Write};
use std::net::TcpListener;
use std::time::Duration;

fn main() -> std::io::Result<()> {
    let listener = TcpListener::bind("127.0.0.1:4329")?;
    println!("Fixture content API ready on 127.0.0.1:4329");
    for stream in listener.incoming() {
        let mut stream = stream?;
        stream.set_read_timeout(Some(Duration::from_secs(2)))?;
        let mut buffer = [0_u8; 16384];
        let count = match stream.read(&mut buffer) {
            Ok(n) => n,
            Err(_) => continue,
        };
        let request = String::from_utf8_lossy(&buffer[..count]);
        let target = request.split_whitespace().nth(1).unwrap_or("");
        let path = target.split('?').next().unwrap_or("").trim_end_matches('/');
        let lang = target.split('?').nth(1).unwrap_or("").split('&')
            .find_map(|pair| pair.strip_prefix("lang=")).unwrap_or("en");
        let place = if lang == "uk" {
            include_str!("place.json").trim().replace("Fixture lake", "Тестове озеро")
        } else {
            include_str!("place.json").trim().to_owned()
        };
        let tour = include_str!("tour.json").trim();
        let article = include_str!("article.json").trim();
        let (status, body) = match path {
            "/health" => (200, "{}".to_owned()),
            "/api/places" | "/api/places/home" => {
                (200, format!("[{place}]"))
            }
            "/api/places/region" => (200, include_str!("region.json").to_owned()),
            "/api/places/more" => {
                let first_page = target
                    .split('?')
                    .nth(1)
                    .unwrap_or("")
                    .split('&')
                    .find_map(|pair| pair.strip_prefix("offset="))
                    .unwrap_or("0")
                    == "0";
                (
                    200,
                    if first_page {
                        format!("{{\"count\":1,\"places\":[{place}]}}")
                    } else {
                        "{\"count\":1,\"places\":[]}".to_owned()
                    },
                )
            }
            "/api/places/fixture-lake" => (200, place.to_owned()),
            "/api/tours" => (200, format!("[{tour}]")),
            "/api/tours/fixture-tour" => (200, tour.to_owned()),
            "/api/articles" => (200, format!("[{article}]")),
            "/api/articles/fixture-story" => (200, article.to_owned()),
            "/api/reviews" => (200, "[]".to_owned()),
            _ => (404, "{\"error\":\"Missing test fixture\"}".to_owned()),
        };
        let response = format!("HTTP/1.1 {status} {}\r\nContent-Type: application/json\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{body}",
            if status == 200 { "OK" } else { "Not Found" }, body.len());
        let _ = stream.write_all(response.as_bytes());
    }
    Ok(())
}

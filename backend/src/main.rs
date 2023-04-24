use image::{Luma, ColorType, ImageResult, EncodableLayout, ImageEncoder, codecs::png};
use qrcode::{QrCode};
use actix_web::{ post, web, App, HttpResponse, HttpServer};
use actix_cors::Cors;
use std::io::{Cursor, Write, Seek, SeekFrom, Read};
use serde::Deserialize;


pub fn write_buffer_impl<W: std::io::Write + Seek>(
    buffered_write: &mut W,
    buf: &[u8],
    width: u32,
    height: u32,
    color: ColorType,
) -> ImageResult<()> {
    png::PngEncoder::new(buffered_write).write_image(buf, width, height, color)
}

pub fn write_buffer_with_format<W>(
    buffered_writer: &mut W,
    buf: &[u8],
    width: u32,
    height: u32,
    color: ColorType,
) -> ImageResult<()>
where
    W: Write + Seek,
{
    // thin wrapper function to strip generics
    write_buffer_impl(buffered_writer, buf, width, height, color)
}

#[derive(Deserialize)]
struct Wifi {
    name: String,
    connection_type: String,
    password: String,
}

impl Wifi {
    fn encode_wifi(&self) -> String{
        let mut encoded_wifi = String::from("WIFI:S:");
        encoded_wifi.push_str(&self.name);
        encoded_wifi.push_str(";T:");
        encoded_wifi.push_str(&self.connection_type);
        encoded_wifi.push_str(";P:");
        encoded_wifi.push_str(&self.password);
        encoded_wifi.push(';');

        return encoded_wifi;
    }
}

#[post("/encodeWifi")]
async fn encode_wifi(wifi: web::Form<Wifi>) -> HttpResponse {
    let wifi_auth =Wifi {
        name: wifi.name.clone(),
        connection_type: wifi.connection_type.clone(),
        password: wifi.password.clone(),
    };

    let encoded_wifi = wifi_auth.encode_wifi();

    let code = QrCode::new::<String>(encoded_wifi).unwrap();

    // Render the bits into an image.
    let image = code.render::<Luma<u8>>().build();

    let mut bytes = Vec::new();

    write_buffer_with_format(&mut Cursor::new(&mut bytes), image.as_bytes(), image.width(), image.height(), ColorType::L8).expect("Cannot handle this data");

    let mut writer = Cursor::new(Vec::new());

    writer.write_all(&image.as_raw()).unwrap();
    writer.seek(SeekFrom::Start(0)).unwrap();
    
    let mut out = Vec::new();
    writer.read_to_end(&mut out).unwrap();
    //writer.write_to(&mut buf, image::ImageOutputFormat::Png)?;
    // Save the image to path.
    image.save("/tmp/qrcode.png").unwrap();

    // Load image from path.
    let image_content = web::block(|| std::fs::read("/tmp/qrcode.png")).await.unwrap().unwrap();
    println!("{:?}", image_content);
    println!("Ok");
    
    HttpResponse::Ok()
    .content_type("image/png")
    .body(bytes)

}

#[actix_web::main]
async fn main() -> std::io::Result<()> {

    HttpServer::new(|| {

        let cors = Cors::default().allowed_origin("http://localhost:3000");
        App::new()
            .wrap(cors)
            .service(encode_wifi)
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}

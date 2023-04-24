use image::{Luma, ColorType, ImageResult, EncodableLayout, ImageEncoder, codecs::png, ImageBuffer};
use qrcode::{QrCode};
use actix_web::{ post, web, App, HttpResponse, HttpServer};
use actix_cors::Cors;
use std::io::{Cursor, Write, Seek};
use serde::Deserialize;


// Rewrite image::write_buffer_impl
pub fn write_buffer_impl<W: std::io::Write + Seek>(
    buffered_write: &mut W,
    buf: &[u8],
    width: u32,
    height: u32,
    color: ColorType,
) -> ImageResult<()> {
    png::PngEncoder::new(buffered_write).write_image(buf, width, height, color)
}

// Rewrite image::write_buffer_with_format
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

    fn generate_qr_code(encoded_wifi: String) -> ImageBuffer<Luma<u8>, Vec<u8>> {
        let code = QrCode::new::<String>(encoded_wifi).unwrap();

        code.render::<Luma<u8>>().build()
    }

    fn save_qr_code_to_buffer(image: ImageBuffer<Luma<u8>, Vec<u8>>) -> Vec<u8> {
        let mut bytes = Vec::new();

        write_buffer_with_format(&mut Cursor::new(&mut bytes), image.as_bytes(), image.width(), image.height(), ColorType::L8).expect("Cannot handle this data");

        return bytes;
    }
}

#[post("/encodeWifi")]
async fn encode_wifi(wifi: web::Form<Wifi>) -> HttpResponse {
    let wifi_auth =Wifi {
        name: wifi.name.clone(),
        connection_type: wifi.connection_type.clone(),
        password: wifi.password.clone(),
    };

    // Encoded Wifi with request data
    let encoded_wifi = wifi_auth.encode_wifi();

    // Generate the QR code as png
    let image = Wifi::generate_qr_code(encoded_wifi);
    
    // Save the image to buffer.
    let bytes = Wifi::save_qr_code_to_buffer(image);
    
    println!("Ok");

    HttpResponse::Ok()
    .content_type("image/png")
    .body(bytes)

}

#[actix_web::main]
async fn main() -> std::io::Result<()> {

    HttpServer::new(|| {

        let cors = Cors::default().allow_any_origin();
        App::new()
            .wrap(cors)
            .service(encode_wifi)
    })
    .bind(("localhost", 8000))?
    .run()
    .await
}

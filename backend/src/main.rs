use image::Luma;
use qrcode::QrCode;
use actix_web::{ post, web, App, HttpResponse, HttpServer};
use serde::Deserialize;

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
    // Save the image.
    image.save("/home/hyhuynh/qrcode.png").unwrap();
    let image_content = web::block(|| std::fs::read("/home/hyhuynh/qrcode.png")).await.unwrap().unwrap();


    // You can also render it into a string.
    let string = code.render().light_color(' ').dark_color('#').build();
    println!("{}", string);
    HttpResponse::Ok()
    .content_type("image/jpeg")
    .body(image_content)

}

#[actix_web::main]
async fn main() -> std::io::Result<()> {

    HttpServer::new(|| {
        App::new()
            .service(encode_wifi)
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}

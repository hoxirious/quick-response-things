use image::Luma;
use qrcode::QrCode;

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

fn main() {

    let wifi_auth =Wifi {
        name: String::from("TELUS0205"),
        connection_type: String::from("WPA"),
        password: String::from("F3VCvBfPmdG6"),        
    };
    let encoded_wifi = wifi_auth.encode_wifi();

    let code = QrCode::new::<String>(encoded_wifi).unwrap();

    // Render the bits into an image.   
    let image = code.render::<Luma<u8>>().build();

    // Save the image.
    image.save("/home/hyhuynh/qrcode.png").unwrap();

    // You can also render it into a string.
    let string = code.render().light_color(' ').dark_color('#').build();
    println!("{}", string);
}

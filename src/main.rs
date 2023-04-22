use qrcode::QrCode;
use image::Luma;

fn main() {
    let code = QrCode::new(&b"Quyen Beo"[..]).unwrap();

// Render the bits into an image.
    let image = code.render::<Luma<u8>>().build();

// Save the image.
image.save("/home/hoxirious/qrcode.png").unwrap();

// You can also render it into a string.
let string = code.render()
    .light_color(' ')
    .dark_color('#')
    .build();
println!("{}", string);
}

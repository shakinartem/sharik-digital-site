import sharp from "sharp";
import { mkdirSync } from "node:fs";

// Фото основателя. Исходник — личный снимок, поэтому готовим
// несколько размеров: большой для карточки «О нас», средний для
// листинга и маленький для подвальной иконки. Отдаём только webp,
// он весит в несколько раз меньше исходного png.
const SRC = "C:/Артём/Бизнес/Стартапы/Шарик digital/image.png";
const OUT = "public/team";
mkdirSync(OUT, { recursive: true });

const meta = await sharp(SRC).metadata();
console.log("исходник:", meta.width + "x" + meta.height, meta.format);

const sizes = [
  ["shakin-480.webp", 480],
  ["shakin-720.webp", 720],
  ["shakin-960.webp", 960],
];

for (const [name, width] of sizes) {
  await sharp(SRC)
    .resize({ width, height: width, fit: "cover", position: "top" })
    .webp({ quality: 82 })
    .toFile(`${OUT}/${name}`);
  console.log("готов", name, width + "px");
}
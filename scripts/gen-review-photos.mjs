import sharp from "sharp";
import { mkdirSync } from "node:fs";

// Аватары авторов отзывов.
//
// Исходники лежат вне репозитория, в «Отзывы фото», и приходят вперемешку:
// где-то нормальный портрет, где-то селфи сверху, где-то снимок в рамке с
// подписью. Поэтому у каждого файла свой кадр — общий «центр» дал бы
// обрезанные лбы или подпись вместо лица.
//
// Кадрирование задано рамками (left, top, width, height) в пикселях исходника.
// Подбирались глазами по этим файлам; размеры зависят от конкретной фотографии,
// поэтому усреднять их нельзя.
//
// Три файла из девяти — не фото, а логотипы компаний (АрхиМед, БИОМЕД,
// КЕРАЛА): авторы отзывов не прислали своих снимков. Логотип нельзя
// обрезать по кругу так же, как лицо, — у «БИОМЕД» и «КЕРАЛА» подпись
// проходит по всей ширине кадра, и маска срезала бы крайние буквы. Поэтому
// логотип вписывается во ВПИСАННЫЙ квадрат круга и кладётся на собственный
// фон логотипа: круг заполняется целиком, шва не видно, подпись цела.

const SRC_DIR = "C:/Артём/Бизнес/Стартапы/Шарик digital/Отзывы фото";
const OUT = "public/reviews";
const SIZE = 160; // аватар 44px, этого хватает для 3x экранов
mkdirSync(OUT, { recursive: true });

/** file — исходник, crop — рамка кадра, id — совпадает с id отзыва. */
const PORTRAITS = [
  {
    id: "dental-pro",
    file: "Аюпов Тагир дентал-про.png",
    crop: { left: 200, top: 30, width: 600, height: 600 },
  },
  {
    id: "po-pyatam",
    file: "Важинская по пятам.png",
    crop: { left: 130, top: 150, width: 540, height: 540 },
  },
  {
    id: "ibradent",
    file: "Ибрагимова Инна ибрадент.png",
    crop: { left: 70, top: 0, width: 460, height: 460 },
  },
  {
    // Снимок из презентации: серые поля по бокам (x 0..76 и 947..1023) и
    // подпись-баннер снизу (с y=1027). Режем по границам чистой фотографии,
    // иначе в кружке окажутся серые полосы и подпись «Директор Интердент».
    id: "interdent",
    file: "Маннапов Ильдар Интердент.png",
    crop: { left: 247, top: 10, width: 560, height: 560 },
  },
  {
    // Селфи сверху, лицо смещено вправо от центра кадра.
    id: "divina-podology",
    file: "Татьяна Дивина подолог.png",
    crop: { left: 90, top: 20, width: 420, height: 420 },
  },
  {
    id: "eurodent",
    file: "Тимченко Святослав Евродент.png",
    crop: { left: 70, top: 0, width: 400, height: 400 },
  },
];

/**
 * Логотипы вместо портретов — у этих трёх авторов нет своего фото.
 *
 * frac — доля стороны аватара, которую занимает логотип. 0.62 берётся из
 * геометрии: сторона вписанного в круг квадрата равна 1/√2 ≈ 0.707, плюс
 * запас, чтобы подпись не подходила к самой кромке.
 *
 * bg — цвет фона самого логотипа. У АрхиМед и БИОМЕД это белый, у КЕРАЛА
 * логотип приходит бежевым на весь кадр, и подставлять чужой фон значило бы
 * оставить видимый прямоугольник внутри круга.
 */
const LOGOS = [
  { id: "arximed-security", file: "Архимед.png", frac: 0.62, bg: "#FFFFFF" },
  { id: "biomed", file: "Биомед.png", frac: 0.62, bg: "#FFFFFF" },
  // КЕРАЛА: подпись «КЕРАЛА» идёт почти по всей ширине кадра, поэтому
  // вписываем целиком и берём меньшую долю — иначе буквы уходят в маску.
  { id: "kerala", file: "Керала.png", frac: 0.78, bg: "#BFA48C" },
];

for (const job of PORTRAITS) {
  const src = `${SRC_DIR}/${job.file}`;
  const out = `${OUT}/${job.id}.webp`;

  await sharp(src)
    .extract(job.crop)
    .resize({ width: SIZE, height: SIZE, fit: "fill" })
    .webp({ quality: 82 })
    .toFile(out);

  console.log("портрет", out, `кадр ${job.crop.width}x${job.crop.height} → ${SIZE}px`);
}

for (const job of LOGOS) {
  const src = `${SRC_DIR}/${job.file}`;
  const out = `${OUT}/${job.id}.webp`;
  const inner = Math.round(SIZE * job.frac);

  // Логотип вписывается целиком: пропорции не искажаем, края не режем.
  const logo = await sharp(src)
    .resize({ width: inner, height: inner, fit: "inside" })
    .toBuffer();
  const { width, height } = await sharp(logo).metadata();

  // Фон логотипа заливает весь квадрат, логотип кладётся по центру.
  await sharp({
    create: {
      width: SIZE,
      height: SIZE,
      channels: 4,
      background: job.bg,
    },
  })
    .composite([
      {
        input: logo,
        top: Math.round((SIZE - height) / 2),
        left: Math.round((SIZE - width) / 2),
      },
    ])
    .webp({ quality: 90, alphaQuality: 100 })
    .toFile(out);

  console.log("логотип", out, `${inner}px в круге ${SIZE}px, фон ${job.bg}`);
}

console.log(
  `\nАватаров: ${PORTRAITS.length + LOGOS.length} ` +
    `(портретов ${PORTRAITS.length}, логотипов ${LOGOS.length}).`
);
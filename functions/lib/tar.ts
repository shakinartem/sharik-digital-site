/**
 * Разбор .tar.gz без сторонних библиотек.
 *
 * Зачем он здесь: админка должна видеть контент, даже если токен GitHub
 * не выдан или отозван. api.github.com без токена отдаёт 403 почти
 * всегда: лимит 60 запросов в час считается на IP, исходящие адреса
 * Cloudflare общие, и лимит исчерпан чужими запросами. Архив с
 * codeload.github.com этому лимиту не подчиняется, и одного запроса
 * достаточно, чтобы узнать все файлы репозитория.
 *
 * Формат tar разбирается вручную: это просто последовательность блоков
 * по 512 байт, а тянуть зависимость ради заголовка не хочется.
 */

/** Размер блока tar. */
const BLOCK = 512;

function concat(a: Uint8Array, b: Uint8Array): Uint8Array {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}

function join(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

/** Строка из буфера: обрезается по первому нулевому байту. */
function readString(block: Uint8Array, offset: number, length: number): string {
  const limit = Math.min(offset + length, block.length);
  let end = offset;
  while (end < limit && block[end] !== 0) end++;
  let out = "";
  for (let i = offset; i < end; i++) out += String.fromCharCode(block[i]);
  return out;
}

/** Размер файла: восьмеричное число в ASCII. */
function readOctal(block: Uint8Array, offset: number, length: number): number {
  const raw = readString(block, offset, length).trim();
  if (!raw) return 0;
  const value = parseInt(raw, 8);
  return Number.isFinite(value) ? value : 0;
}

function isZeroBlock(block: Uint8Array): boolean {
  for (let i = 0; i < block.length; i++) {
    if (block[i] !== 0) return false;
  }
  return true;
}

/**
 * Достаёт из архива только те файлы, которые принимает фильтр.
 *
 * Остальные пропускаются на лету и в память не попадают: архив
 * репозитория весит несколько мегабайт, а нужны два десятка файлов.
 */
export async function readFilesFromTarGz(
  response: Response,
  rootPrefix: string,
  accept: (path: string) => boolean,
  onFile: (path: string, data: Uint8Array) => void,
): Promise<void> {
  if (!response.body) throw new Error("Архив пришёл без тела ответа");

  const reader = response.body
    .pipeThrough(new DecompressionStream("gzip"))
    .getReader();

  let carry = new Uint8Array(0);
  let mode: "header" | "data" | "pad" = "header";
  // Сколько байт данных текущей записи ещё осталось прочитать.
  let remaining = 0;
  // Полный размер записи: по нему считается выравнивание до 512 байт.
  let fileSize = 0;
  let padLeft = 0;
  let path = "";
  let collecting = false;
  let parts: Uint8Array[] = [];

  const finish = () => {
    if (collecting) onFile(path, join(parts));
    collecting = false;
    parts = [];
  };

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;

    let chunk = value;
    if (carry.length) {
      chunk = concat(carry, value);
      carry = new Uint8Array(0);
    }

    let pos = 0;
    while (pos < chunk.length) {
      if (mode === "data") {
        const take = Math.min(remaining, chunk.length - pos);
        if (collecting) parts.push(chunk.slice(pos, pos + take));
        pos += take;
        remaining -= take;
        if (remaining === 0) {
          finish();
          padLeft = (BLOCK - (fileSize % BLOCK)) % BLOCK;
          mode = padLeft ? "pad" : "header";
        }
        continue;
      }

      if (mode === "pad") {
        const take = Math.min(padLeft, chunk.length - pos);
        pos += take;
        padLeft -= take;
        if (padLeft === 0) mode = "header";
        continue;
      }

      if (chunk.length - pos < BLOCK) {
        carry = chunk.slice(pos);
        pos = chunk.length;
        break;
      }

      const header = chunk.subarray(pos, pos + BLOCK);
      pos += BLOCK;

      // Два нулевых блока подряд означают конец архива.
      if (isZeroBlock(header)) {
        finish();
        return;
      }

      const size = readOctal(header, 124, 12);
      const type = String.fromCharCode(header[156] || 48);
      const name = readString(header, 0, 100);
      const dirPrefix = readString(header, 345, 155);

      const full = dirPrefix ? dirPrefix + "/" + name : name;
      // Пустой rootPrefix означает «отбросить верхний каталог архива»:
      // codeload кладёт файлы в <repo>-<branch>/, а косую черту в имени
      // ветки меняет на дефис, поэтому вычислить этот каталог заранее
      // нельзя — проще отбросить первый сегмент пути.
      const relative = rootPrefix
        ? full.startsWith(rootPrefix)
          ? full.slice(rootPrefix.length)
          : full
        : full.slice(full.indexOf("/") + 1);

      // Обычный файл: '0' или NUL. Остальное (каталоги, ссылки) —
      // пропускаем, но его размер всё равно нужно «съесть».
      const isFile = type === "0" || type === "\0" || type === " ";

      fileSize = size;
      path = isFile ? relative : "";
      collecting = isFile && accept(relative);
      parts = [];
      remaining = size;

      if (size === 0) {
        finish();
        mode = "header";
      } else {
        mode = "data";
      }
    }
  }
}
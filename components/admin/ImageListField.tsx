"use client";

import { ImageUpload } from "@/components/admin/ImageUpload";

/**
 * Список изображений материала: загрузка, порядок, удаление.
 *
 * Отдельный компонент, потому что у одного кейса бывает несколько
 * фотографий, а форма загрузчика работает с одним значением. Первое
 * фото из списка используется как обложка карточки на сайте
 * (components/CasesSection.tsx), поэтому порядок важен: перестановка
 * меняет обложку, и это должно быть видно и осознанно.
 */
export function ImageListField({
  token,
  label,
  value,
  onChange,
  hint,
}: {
  token: string;
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  hint?: string;
}) {
  const field = "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm";
  const button =
    "rounded-lg border border-neutral-300 px-2.5 py-1 text-xs font-medium hover:bg-neutral-100 disabled:opacity-40";

  const replace = (index: number, url: string) => {
    const next = value.slice();
    next[index] = url;
    onChange(next);
  };

  const move = (index: number, shift: number) => {
    const target = index + shift;
    if (target < 0 || target >= value.length) return;
    const next = value.slice();
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    onChange(next);
  };

  const remove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div>
      <p className="mb-1 block text-sm font-medium text-neutral-700">{label}</p>
      <p className="mb-2 text-xs text-neutral-500">
        {hint ||
          "Первое фото становится обложкой карточки кейса. Остальные идут галереей в подробном разборе."}
      </p>

      {value.length === 0 && (
        <p className="rounded-lg border border-dashed border-neutral-300 px-3 py-4 text-center text-xs text-neutral-500">
          Фото пока нет. Кейс без картинок выводится без обложки.
        </p>
      )}

      <ul className="space-y-3">
        {value.map((src, index) => (
          <li
            key={`${index}-${src}`}
            className="flex flex-col gap-3 rounded-xl border border-neutral-200 p-3 sm:flex-row"
          >
            <span className="flex h-24 w-full shrink-0 items-center justify-center overflow-hidden rounded-lg bg-neutral-50 sm:w-32">
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="px-2 text-center text-[11px] text-neutral-400">
                  нет фото
                </span>
              )}
            </span>

            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-semibold">
                  {index === 0 ? "Обложка" : `Фото ${index + 1}`}
                </span>
              </div>

              <input
                className={field}
                value={src}
                onChange={(e) => replace(index, e.target.value)}
                placeholder="/media/имя-файла.jpg"
                aria-label={`Путь к фото ${index + 1}`}
              />

              <div className="flex flex-wrap items-center gap-2">
                <ImageUpload
                  token={token}
                  id={`case-image-${index}`}
                  label="Заменить"
                  value=""
                  hint=""
                  onChange={(url) => replace(index, url)}
                />
                <button
                  type="button"
                  className={button}
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label="Сдвинуть фото выше"
                >
                  Выше
                </button>
                <button
                  type="button"
                  className={button}
                  onClick={() => move(index, 1)}
                  disabled={index === value.length - 1}
                  aria-label="Сдвинуть фото ниже"
                >
                  Ниже
                </button>
                <button
                  type="button"
                  className="rounded-lg px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                  onClick={() => remove(index)}
                >
                  Убрать
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Добавление нового файла: загрузчик сразу дописывает его в конец
          списка, поэтому обложкой становится только первое фото. */}
      <div className="mt-3 rounded-xl border border-neutral-200 p-3">
        <ImageUpload
          token={token}
          id="case-image-new"
          label="Добавить фото"
          value=""
          hint="Файл уйдёт в репозиторий и появится на сайте после публикации."
          onChange={(url) => onChange([...value, url])}
        />
      </div>
    </div>
  );
}

"use client";

import { useRef, useState } from "react";

/**
 * Загрузка изображения в R2.
 *
 * Возвращает готовый путь вида /media/<ключ> — его и вставляют в
 * markdown статьи, и записывают в поле photo у отзыва.
 *
 * Если хранилище не подключено, сервер вернёт понятную ошибку, и она
 * показывается здесь же: молчаливая неудача выглядела бы как «файл не
 * загрузился» без причины.
 */
export function ImageUpload({
  token,
  label,
  value,
  onChange,
  onUploaded,
  onBeforeUpload,
  hint,
  id,
}: {
  token: string;
  label: string;
  value: string;
  onChange: (url: string) => void;
  /**
   * Вызывается после успешной загрузки, кроме onChange.
   *
   * Нужен там, где фото становится частью текста, а не значением
   * поля: в статье картинка вставляется в тело документа строкой
   * ![описание](путь), и подставить её в input нельзя.
   */
  onUploaded?: (url: string) => void;
  /**
   * Вызывается в момент выбора файла, до отправки.
   *
   * Пока файл загружается, пользователь может переключиться на другое
   * поле. Если запоминать позицию курсора после загрузки, картинка
   * вставится не туда, куда её ждали, поэтому позиция снимается здесь.
   */
  onBeforeUpload?: () => void;
  hint?: string;
  /** Явный id: подпись привязывается к полю через htmlFor. */
  id?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const field = "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm";
  const labelClass = "mb-1 block text-sm font-medium text-neutral-700";
  // Без явного id подпись указывала бы на отсутствующий элемент, и
  // клик по ней не открывал бы выбор файла.
  const fieldId = id || "upload-" + label;

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
        body: form,
      });
      const data = (await response.json()) as { error?: string; url?: string };
      if (!response.ok || !data.url) throw new Error(data.error || "Не удалось загрузить");
      onChange(data.url);
      onUploaded?.(data.url);
    } catch (uploadError) {
      setError((uploadError as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <label className={labelClass} htmlFor={fieldId}>
        {label}
      </label>

      <div className="flex items-start gap-3">
        {/* Превью помогает понять, что загружено нужное фото,
            а не файл с прошлой загрузки. */}
        <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-300 bg-neutral-50">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-neutral-400">нет фото</span>
          )}
        </span>

        <div className="min-w-0 flex-1 space-y-2">
          <input
            ref={inputRef}
            id={fieldId}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            className="block w-full text-xs text-neutral-600 file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-900 file:px-3 file:py-2 file:text-xs file:font-medium file:text-white"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onBeforeUpload?.();
                upload(file);
              }
            }}
            disabled={busy}
          />
          <input
            className={field}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="/media/имя-файла.jpg или /cases/photo.webp"
          />
          {hint && <p className="text-xs text-neutral-500">{hint}</p>}
          {busy && <p className="text-xs text-neutral-500">Загружаю…</p>}
          {error && <p className="text-xs text-red-700">{error}</p>}
        </div>
      </div>
    </div>
  );
}

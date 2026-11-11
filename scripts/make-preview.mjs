import { mkdir, readFile, writeFile } from "node:fs/promises";

await mkdir(new URL("../preview/", import.meta.url), { recursive: true });
const source = await readFile(
  new URL("../standalone/index.html", import.meta.url),
  "utf8",
);
const icon = await readFile(
  new URL("../src/assets/logo-enosi-transparent.png", import.meta.url),
);
const iconUrl = `data:image/png;base64,${icon.toString("base64")}`;
const html = source
  .replace(
    /(?:\.\/)?(?:assets\/)?logo-enosi-transparent-[A-Za-z0-9_-]+\.png/g,
    iconUrl,
  )
  .replace(
    /<link\b[^>]*\brel="icon"[^>]*>/,
    `<link rel="icon" type="image/png" href="${iconUrl}">`,
  );
await writeFile(new URL("../preview/ENOSI.html", import.meta.url), html);
console.log(
  "Готово: preview/ENOSI.html. Скачайте этот файл и откройте его в браузере. Интернет для просмотра не требуется.",
);

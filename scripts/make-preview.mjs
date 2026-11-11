import { mkdir, readFile, writeFile } from "node:fs/promises";

await mkdir(new URL("../preview/", import.meta.url), { recursive: true });
const source = await readFile(new URL("../standalone/index.html", import.meta.url), "utf8");
const icon = await readFile(new URL("../src/assets/logo-enosi.jpg", import.meta.url));
const iconUrl = `data:image/jpeg;base64,${icon.toString("base64")}`;
const html = source
  .replace(/(?:\.\/)?(?:assets\/)?logo-enosi-[A-Za-z0-9_-]+\.jpg/g, iconUrl)
  .replace(/<link\b[^>]*\brel="icon"[^>]*>/, `<link rel="icon" type="image/jpeg" href="${iconUrl}">`);
await writeFile(new URL("../preview/ENOSI.html", import.meta.url), html);
console.log(
  "Готово: preview/ENOSI.html. Скачайте этот файл и откройте его в браузере. Интернет для просмотра не требуется.",
);

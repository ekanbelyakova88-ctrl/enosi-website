import { mkdir, copyFile } from 'node:fs/promises';

await mkdir(new URL('../preview/', import.meta.url), { recursive: true });
await copyFile(new URL('../dist/index.html', import.meta.url), new URL('../preview/ENOSI.html', import.meta.url));
console.log('Готово: preview/ENOSI.html. Скачайте этот файл и откройте его в браузере. Интернет для просмотра не требуется.');

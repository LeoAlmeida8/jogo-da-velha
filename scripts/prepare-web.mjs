import { mkdir, copyFile } from "node:fs/promises";
import { resolve } from "node:path";

const project = process.cwd();
const webDirectory = resolve(project, "www");
const files = [
    "index.html",
    "style.css",
    "script.js",
    "manifest.json",
    "service-worker.js",
    "icon-192.png",
    "icon-512.png"
];

await mkdir(webDirectory, { recursive: true });

for (const file of files) {
    await copyFile(resolve(project, file), resolve(webDirectory, file));
}

const audioDirectory = resolve(webDirectory, "assets", "audio");
await mkdir(audioDirectory, { recursive: true });
await copyFile(
    resolve(project, "assets", "audio", "MusicaFundo.ogg"),
    resolve(audioDirectory, "MusicaFundo.ogg")
);

console.log("Arquivos do app preparados em " + webDirectory);

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const project = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const keystore = join(project, "android", "app", "debug.keystore");

if (existsSync(keystore)) {
    console.log("Chave local de depuração já está pronta.");
    process.exit(0);
}

const programFiles = process.env.ProgramFiles || "C:\\Program Files";
const localAppData = process.env.LOCALAPPDATA || "";
const keytoolCandidates = [
    process.env.JAVA_HOME && join(process.env.JAVA_HOME, "bin", "keytool.exe"),
    join(programFiles, "Android", "Android Studio", "jbr", "bin", "keytool.exe"),
    localAppData && join(localAppData, "Programs", "Android Studio", "jbr", "bin", "keytool.exe")
].filter(Boolean);

const keytool = keytoolCandidates.find(existsSync) || "keytool.exe";
const result = spawnSync(keytool, [
    "-genkeypair",
    "-v",
    "-keystore", keystore,
    "-storepass", "android",
    "-alias", "androiddebugkey",
    "-keypass", "android",
    "-keyalg", "RSA",
    "-keysize", "2048",
    "-validity", "10000",
    "-dname", "CN=Android Debug,O=Android,C=US"
], { stdio: "inherit" });

if (result.error || result.status !== 0) {
    console.error("Não foi possível criar a chave de depuração. Verifique se o JDK do Android Studio está instalado ou defina JAVA_HOME.");
    process.exit(result.status || 1);
}

console.log("Chave de depuração criada localmente.");

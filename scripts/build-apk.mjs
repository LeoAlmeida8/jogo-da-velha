import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const project = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const androidProject = join(project, "android");
const localPropertiesPath = join(androidProject, "local.properties");
const gradleTask = process.argv[2] || "assembleDebug";
const releaseTasks = new Set(["assembleRelease", "bundleRelease"]);

if (!["assembleDebug", ...releaseTasks].includes(gradleTask)) {
    console.error(`Tarefa Gradle não permitida: ${gradleTask}`);
    process.exit(1);
}

if (releaseTasks.has(gradleTask) && !existsSync(join(androidProject, "keystore.properties"))) {
    console.error("Assinatura de lançamento não configurada. Crie android/keystore.properties conforme as instruções do README.");
    process.exit(1);
}

const localProperties = existsSync(localPropertiesPath)
    ? readFileSync(localPropertiesPath, "utf8")
    : "";
const sdkMatch = localProperties.match(/^sdk\.dir=(.+)$/m);
const programFiles = process.env.ProgramFiles || "C:\\Program Files";
const localAppData = process.env.LOCALAPPDATA || "";
const javaHomes = [
    process.env.JAVA_HOME,
    join(programFiles, "Android", "Android Studio", "jbr"),
    localAppData && join(localAppData, "Programs", "Android Studio", "jbr")
].filter(Boolean);
const javaHome = javaHomes.find((candidate) => existsSync(join(candidate, "bin", "java.exe")));

if (!javaHome) {
    console.error("Não encontrei o JDK do Android Studio. Abra a pasta android/ no Android Studio e confirme o JDK em Gradle JDK.");
    process.exit(1);
}

const env = {
    ...process.env,
    JAVA_HOME: javaHome
};

if (sdkMatch) {
    const sdkPath = sdkMatch[1].replaceAll("/", "\\\\");
    env.ANDROID_HOME = sdkPath;
    env.ANDROID_SDK_ROOT = sdkPath;
}

const result = spawnSync(
    process.env.COMSPEC || "cmd.exe",
    ["/d", "/c", `gradlew.bat ${gradleTask}`],
    { cwd: androidProject, env, stdio: "inherit" }
);

if (result.error || result.status !== 0) {
    process.exit(result.status || 1);
}

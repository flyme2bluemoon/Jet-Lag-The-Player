import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateGeoJsonAssets } from "./generate-geojson-assets.mjs";

const appDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDirectory = path.join(appDirectory, "assets", "geojson");
const supportedExtensions = new Set([".geojson", ".json"]);

async function getSourceRevision() {
    const entries = await readdir(sourceDirectory, { withFileTypes: true });
    const sourceNames = entries
        .filter((entry) => entry.isFile())
        .map((entry) => entry.name)
        .filter((sourceName) =>
            supportedExtensions.has(path.extname(sourceName).toLowerCase()),
        )
        .sort();
    const revisions = await Promise.all(sourceNames.map(async (sourceName) => {
        const metadata = await stat(path.join(sourceDirectory, sourceName));
        return `${sourceName}:${metadata.size}:${metadata.mtimeMs}`;
    }));

    return revisions.join("\n");
}

let sourceRevision = await getSourceRevision();
let checking = false;

setInterval(async () => {
    if (checking) return;
    checking = true;

    try {
        const nextRevision = await getSourceRevision();
        if (nextRevision !== sourceRevision) {
            await generateGeoJsonAssets();
            sourceRevision = nextRevision;
            console.log("Regenerated GeoJSON assets.");
        }
    } catch (error) {
        console.error("Unable to regenerate GeoJSON assets:", error);
    } finally {
        checking = false;
    }
}, 500);

console.log(`Watching ${sourceDirectory}`);

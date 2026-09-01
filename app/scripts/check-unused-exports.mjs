import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Next.js resolves route files by convention, so their exports have no importer.
const ROUTE_FILES = /^src\/app\//;

const DECLARATION =
    /^(?<indent>[ \t]*)export\s+(?<modifiers>(?:declare\s+)?(?:async\s+)?)(?<kind>const|let|var|function|type|interface|class|enum)\s+(?<name>[A-Za-z_$][\w$]*)/;

function listFiles() {
    const found = execSync(
        "find src scripts -type f \\( -name '*.ts' -o -name '*.tsx' -o -name '*.mjs' \\)",
        { cwd: appDirectory, encoding: "utf8" },
    );
    return found.trim().split("\n").filter(Boolean).sort();
}

function readCorpus(files) {
    return new Map(
        files.map((file) => [file, readFileSync(path.join(appDirectory, file), "utf8")]),
    );
}

function findExports(corpus) {
    const rows = [];

    for (const [file, text] of corpus) {
        if (ROUTE_FILES.test(file) || !/\.tsx?$/.test(file)) continue;

        text.split("\n").forEach((line, index) => {
            const match = DECLARATION.exec(line);
            if (!match) return;

            const { name, kind } = match.groups;
            const occurrences = new RegExp(`\\b${name}\\b`, "g");
            let external = 0;

            for (const [other, otherText] of corpus) {
                if (other === file) continue;
                external += (otherText.match(occurrences) ?? []).length;
            }

            rows.push({
                file,
                line: index + 1,
                kind,
                name,
                external,
                internal: (text.match(occurrences) ?? []).length - 1,
            });
        });
    }

    return rows;
}

function stripExportKeyword(corpus, rows) {
    const byFile = new Map();
    for (const row of rows) {
        if (!byFile.has(row.file)) byFile.set(row.file, []);
        byFile.get(row.file).push(row);
    }

    for (const [file, fileRows] of byFile) {
        const lines = corpus.get(file).split("\n");
        for (const row of fileRows) {
            lines[row.line - 1] = lines[row.line - 1].replace(/^(\s*)export\s+/, "$1");
        }
        writeFileSync(path.join(appDirectory, file), lines.join("\n"));
    }

    return byFile.size;
}

const scope = process.argv.find((argument) => argument.startsWith("--scope="));
const prefix = scope ? scope.slice("--scope=".length) : "";
const shouldFix = process.argv.includes("--fix");

const corpus = readCorpus(listFiles());
const rows = findExports(corpus).filter((row) => row.file.startsWith(prefix));
const dead = rows.filter((row) => row.external === 0 && row.internal === 0);
const localOnly = rows.filter((row) => row.external === 0 && row.internal > 0);

const describe = (row) => `  ${row.file}:${row.line} ${row.kind} ${row.name}`;

console.log(`Scanned ${rows.length} exports across ${corpus.size} files.`);
console.log(`\nUnreferenced declarations (${dead.length}) - delete these by hand:`);
dead.forEach((row) => console.log(describe(row)));
console.log(`\nExported but only used in their own file (${localOnly.length}):`);
localOnly.forEach((row) => console.log(describe(row)));

if (shouldFix && localOnly.length) {
    const touched = stripExportKeyword(corpus, localOnly);
    console.log(`\nRemoved the export keyword from ${localOnly.length} declarations in ${touched} files.`);
    process.exitCode = 0;
} else {
    process.exitCode = dead.length + localOnly.length > 0 ? 1 : 0;
}

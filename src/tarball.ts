import https from "https";
import http from "http";
import zlib from "zlib";
import fs from "fs";
import path from "path";

function downloadAndDecompress(url: string) {
    return new Promise<Buffer>((resolve, reject) => {
        function request(currentUrl: string, redirects = 0): void {
            if (redirects > 10) {
                reject(new Error("Too many redirects"));
                return;
            }
            const mod = currentUrl.startsWith("https:") ? https : http;
            mod.get(currentUrl, (res) => {
                if (
                    res.statusCode &&
                    res.statusCode >= 300 &&
                    res.statusCode < 400 &&
                    res.headers.location
                ) {
                    request(res.headers.location, redirects + 1);
                } else if (res.statusCode !== 200) {
                    reject(new Error(`HTTP ${res.statusCode}`));
                } else {
                    const gunzip = zlib.createGunzip();
                    const chunks: Buffer[] = [];
                    res.pipe(gunzip);
                    gunzip.on("data", (chunk: Buffer) => chunks.push(chunk));
                    gunzip.on("end", () => resolve(Buffer.concat(chunks)));
                    gunzip.on("error", reject);
                }
            }).on("error", reject);
        }
        request(url);
    });
}

function extractTar(tarBuffer: Buffer, destDir: string) {
    let pos = 0;
    while (pos + 512 <= tarBuffer.length) {
        if (tarBuffer[pos] === 0) break;

        const name = tarBuffer
            .subarray(pos, pos + 100)
            .toString()
            .replace(/\0/g, "");
        const sizeStr = tarBuffer
            .subarray(pos + 124, pos + 136)
            .toString()
            .replace(/\0/g, "")
            .trim();
        const size = parseInt(sizeStr, 8) || 0;
        const type = tarBuffer[pos + 156];
        pos += 512;

        const isDir = type === 0x35 || name.endsWith("/");
        const isFile = type === 0x30 || type === 0;

        if (isDir || isFile) {
            // Strip top-level directory component that GitHub adds (repo-branch/)
            const relPath = name
                .replace(/\/$/, "")
                .split("/")
                .slice(1)
                .join("/");
            if (relPath) {
                const outPath = path.join(destDir, relPath);
                if (isDir) {
                    fs.mkdirSync(outPath, { recursive: true });
                } else {
                    fs.mkdirSync(path.dirname(outPath), { recursive: true });
                    fs.writeFileSync(
                        outPath,
                        tarBuffer.subarray(pos, pos + size)
                    );
                }
            }
        }

        pos += Math.ceil(size / 512) * 512;
    }
}

export async function downloadAndExtractTarball(
    tarUrl: string,
    destDir: string
) {
    fs.mkdirSync(destDir, { recursive: true });
    const tarBuffer = await downloadAndDecompress(tarUrl);
    extractTar(tarBuffer, destDir);
}

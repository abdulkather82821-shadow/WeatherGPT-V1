import { createServer } from "node:http";
import { createReadStream, statSync } from "node:fs";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../www", import.meta.url)));
const mime = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".manifest", "application/manifest+json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".webmanifest", "application/manifest+json; charset=utf-8"]
]);
const port = Number(process.env.PORT) || 8000;
const host = process.env.HOST || "0.0.0.0";

createServer((request, response) => {
  const pathname = new URL(request.url || "/", "http://localhost").pathname;
  let file;
  try {
    file = resolve(root, `.${decodeURIComponent(pathname === "/" ? "/index.html" : pathname)}`);
    if (!file.startsWith(root + sep) && file !== root) { response.writeHead(403).end("Forbidden"); return; }
    if (!statSync(file).isFile()) { response.writeHead(404).end("Not found"); return; }
  } catch {
    response.writeHead(404).end("Not found");
    return;
  }

  response.writeHead(200, {
    "Content-Type": mime.get(extname(file)) || "application/octet-stream",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(self), geolocation=(self), payment=(), usb=()"
  });
  createReadStream(file).pipe(response);
}).listen(port, host, () => console.log(`WeatherGPT is available at http://${host}:${port}/`));

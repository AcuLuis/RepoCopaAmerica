// Servidor local mínimo para ver el sitio sin instalar nada adicional.
// Uso: node servidor.js [puerto]   (por defecto 8000)
"use strict";

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const RAIZ = __dirname;
const PUERTO = Number(process.argv[2]) || 8000;

const TIPOS = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".xml": "application/xml; charset=utf-8",
    ".txt": "text/plain; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".avif": "image/avif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon"
};

function enviarArchivo(respuesta, ruta, estado) {
    const tipo = TIPOS[path.extname(ruta).toLowerCase()] || "application/octet-stream";
    respuesta.writeHead(estado, { "Content-Type": tipo });
    fs.createReadStream(ruta).pipe(respuesta);
}

const servidor = http.createServer(function (peticion, respuesta) {
    let rutaPedida;
    try {
        rutaPedida = decodeURIComponent(new URL(peticion.url, "http://localhost").pathname);
    } catch (error) {
        respuesta.writeHead(400);
        respuesta.end("Solicitud no válida");
        return;
    }

    if (rutaPedida.endsWith("/")) {
        rutaPedida += "index.html";
    }

    // Evita salir de la carpeta del proyecto (por ejemplo con "../").
    const ruta = path.join(RAIZ, path.normalize(rutaPedida));
    if (!ruta.startsWith(RAIZ)) {
        respuesta.writeHead(403);
        respuesta.end("Acceso denegado");
        return;
    }

    fs.stat(ruta, function (error, info) {
        if (!error && info.isFile()) {
            enviarArchivo(respuesta, ruta, 200);
        } else {
            enviarArchivo(respuesta, path.join(RAIZ, "404.html"), 404);
        }
    });
});

servidor.on("error", function (error) {
    if (error.code === "EADDRINUSE") {
        console.error("El puerto " + PUERTO + " ya está en uso. Prueba con otro: node servidor.js 8080");
    } else {
        console.error(error.message);
    }
    process.exit(1);
});

servidor.listen(PUERTO, "127.0.0.1", function () {
    console.log("Sitio disponible en http://localhost:" + PUERTO + "/");
    console.log("Presiona Ctrl + C para detener el servidor.");
});

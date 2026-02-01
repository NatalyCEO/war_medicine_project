const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    // Убираем query string и decode URI
    let filePath = req.url.split('?')[0];
    filePath = decodeURIComponent(filePath);

    // Если запрашивается корень, отдаем index.html
    if (filePath === '/' || filePath === '') {
        filePath = '/index.html';
    }

    // Полный путь к файлу
    const fullPath = path.join(__dirname, filePath);

    // Проверяем, что файл находится внутри директории проекта (безопасность)
    const relativePath = path.relative(__dirname, fullPath);
    if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    // Читаем файл
    fs.readFile(fullPath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Internal server error');
            }
            return;
        }

        // Определяем MIME тип
        const ext = path.extname(fullPath).toLowerCase();
        const mimeTypes = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon',
            '.csv': 'text/csv'
        };

        const contentType = mimeTypes[ext] || 'text/plain';

        res.writeHead(200, {
            'Content-Type': contentType,
            'Cache-Control': 'no-cache'
        });
        res.end(data);
    });
});

const PORT = 8000;

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Press Ctrl+C to stop the server`);
});
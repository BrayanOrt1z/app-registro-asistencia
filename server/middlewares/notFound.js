import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function notFound(req, res, next) {
    res.status(404).sendFile(path.join(__dirname, '../../client/pages/404.html'));
}

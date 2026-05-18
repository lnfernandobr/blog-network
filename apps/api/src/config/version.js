import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Read once at load time — version + name from local package.json.
const pkgPath = resolve(dirname(fileURLToPath(import.meta.url)), '../../package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

export const API_NAME = pkg.name;
export const API_VERSION = pkg.version;
export const API_DESCRIPTION = pkg.description ?? 'fernandolimaindie API';


import fs from 'fs'
import glob from 'glob'
import path from 'path'
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find fixtures for each predicate and expected return type
const ext = '*.json';
export const fixtures = {};

[
  'contains',
  'coveredby',
  'covers',
  'crosses',
  'disjoint',
  'equals',
  'intersects',
  'overlaps',
  'touches',
  'within',
].forEach((predicate) => {
  fixtures[predicate] = {};
  [
    'true',
    'false',
    'throws',
  ].forEach((type) => {
    fixtures[predicate][type] = [];
    const pattern = path.join(__dirname, 'data', predicate, type, '**', ext);
    glob.sync(pattern).forEach((filepath) => {
      const geojson = JSON.parse(fs.readFileSync(filepath));
      fixtures[predicate][type].push(geojson);
    });
  });
});

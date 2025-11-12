import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const packagesDir = join(rootDir, 'packages');
const taskxDir = join(packagesDir, 'taskx');

const filesToCopy = [
  { source: 'README.md', destination: 'README.md' },
  { source: 'LICENSE', destination: 'LICENSE' }
];

filesToCopy.forEach(({ source, destination }) => {
  const sourcePath = join(rootDir, source);
  const destPath = join(taskxDir, destination);
  
  try {
    fs.copyFileSync(sourcePath, destPath);
  } catch (error) {
    process.exit(1);
  }
});

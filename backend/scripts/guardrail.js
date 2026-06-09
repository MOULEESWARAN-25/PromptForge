import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '../..');

const scanDirectories = [
  path.join(rootDir, 'frontend/src'),
  path.join(rootDir, 'backend')
];

const excludeFiles = [
  path.normalize(path.join(rootDir, 'backend/scripts/seed.js')),
  path.normalize(path.join(rootDir, 'backend/scripts/guardrail.js')),
  path.normalize(path.join(rootDir, 'frontend/src/data/designVocabulary.js')),
  path.normalize(path.join(rootDir, 'frontend/src/config/themeStyles.js'))
];

function getFilesRecursively(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        results = results.concat(getFilesRecursively(fullPath));
      }
    } else {
      const ext = path.extname(fullPath);
      if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
        results.push(fullPath);
      }
    }
  });
  
  return results;
}

console.log('🔍 Starting PromptForge CI Guardrail Scan...');
let violationsCount = 0;

scanDirectories.forEach(dir => {
  if (!fs.existsSync(dir)) return;
  
  const files = getFilesRecursively(dir);
  files.forEach(file => {
    const normalizedFile = path.normalize(file);
    if (excludeFiles.includes(normalizedFile)) {
      return;
    }
    
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for any imports of designVocabulary
    if (content.includes('designVocabulary')) {
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (line.includes('designVocabulary') && !line.trim().startsWith('//')) {
          console.error(`❌ Violation found in ${path.relative(rootDir, file)}:L${idx + 1}`);
          console.error(`   > ${line.trim()}`);
          violationsCount++;
        }
      });
    }
  });
});

if (violationsCount > 0) {
  console.error(`\n🚨 Guardrail Failed: Found ${violationsCount} runtime references/imports of "designVocabulary".`);
  process.exit(1);
} else {
  console.log('✅ Guardrail Passed: No runtime references/imports of "designVocabulary" found!');
  process.exit(0);
}

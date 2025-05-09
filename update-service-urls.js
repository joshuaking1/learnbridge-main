/**
 * Script to update all localhost URLs to production render.com URLs
 * Run with: node update-service-urls.js
 */

const fs = require('fs');
const path = require('path');

// Define URL mappings
const URL_MAPPINGS = [
  { from: 'http://localhost:3001', to: 'https://user-service-3j2j.onrender.com' },
  { from: 'http://localhost:3004', to: 'https://learnbridge-ai-service.onrender.com' },
  { from: 'http://localhost:3005', to: 'https://learnbridge-teacher-tools-service.onrender.com' },
  { from: 'http://localhost:3006', to: 'https://learnbridgedu.onrender.com' },
  { from: 'http://localhost:3007', to: 'https://learnbridge-teacher-tools-service.onrender.com' },
  { from: 'http://localhost:3008', to: 'https://user-service-3j2j.onrender.com' },
  { from: 'http://localhost:3003', to: 'https://learnbridge-ai-service.onrender.com' },
];

// Define directories to search
const SEARCH_DIRS = [
  path.join(__dirname, 'src'),
];

// Define files to ignore
const IGNORE_FILES = [
  'node_modules',
  '.next',
  '.git',
  'update-service-urls.js'
];

// Function to check if a file should be ignored
function shouldIgnore(filePath) {
  return IGNORE_FILES.some(ignoreItem => filePath.includes(ignoreItem));
}

// Function to process a file
async function processFile(filePath) {
  try {
    // Check file extension
    const ext = path.extname(filePath).toLowerCase();
    if (!['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
      return;
    }
    
    // Read file content
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Apply URL replacements
    URL_MAPPINGS.forEach(mapping => {
      if (content.includes(mapping.from)) {
        content = content.replace(new RegExp(mapping.from, 'g'), mapping.to);
        modified = true;
        console.log(`Updated ${mapping.from} to ${mapping.to} in ${filePath}`);
      }
    });
    
    // Save file if modified
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Saved changes to ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}

// Function to walk directories recursively
async function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    
    if (shouldIgnore(filePath)) {
      continue;
    }
    
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      await walkDir(filePath);
    } else {
      await processFile(filePath);
    }
  }
}

// Main function
async function main() {
  console.log('Starting service URL updates...');
  
  for (const dir of SEARCH_DIRS) {
    await walkDir(dir);
  }
  
  console.log('Service URL updates completed!');
}

// Run the script
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});

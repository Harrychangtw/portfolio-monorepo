import fs from 'fs';
import path from 'path';
import https from 'https';
import { execSync } from 'child_process';

const FONT_DIR = path.join(process.cwd(), 'public', 'fonts');
const ZIP_PATH = path.join(FONT_DIR, 'artific-fonts.zip');
const FILE_ID = process.env.FONT_DRIVE_ID; 

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    
    const request = https.get(url, (response) => {
      // Handle redirects (Google Drive uses 302/303)
      if (response.statusCode === 302 || response.statusCode === 303) {
        // IMPORTANT: Destroy the response to free the socket before recursing
        response.destroy();
        downloadFile(response.headers.location, dest)
          .then(resolve)
          .catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        response.destroy();
        fs.unlink(dest, () => {}); // Delete partial file
        reject(new Error(`Server returned status code ${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        // file.close() requires a callback to ensure the file descriptor is actually closed
        file.close(() => resolve());
      });
    });

    request.on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  try {
    if (!fs.existsSync(FONT_DIR)) {
      fs.mkdirSync(FONT_DIR, { recursive: true });
    }

    // Fast exit if fonts exist
    if (fs.existsSync(path.join(FONT_DIR, 'Artific-Regular.woff2'))) {
      console.log('✅ Fonts already present. Skipping download.');
      process.exit(0); // Explicitly exit
    }

    if (!FILE_ID) {
      console.warn('⚠️ No FONT_DRIVE_ID found. Skipping font download.');
      process.exit(0); // Explicitly exit
    }

    console.log('⬇️ Downloading fonts...');
    // Google Drive direct download link format
    const url = `https://drive.google.com/uc?export=download&id=${FILE_ID}`;
    
    await downloadFile(url, ZIP_PATH);
    
    console.log('📦 Unzipping...');
    // -o forces overwrite without prompting
    execSync(`unzip -o -q "${ZIP_PATH}" -d "${FONT_DIR}"`);
    
    // Cleanup zip
    if (fs.existsSync(ZIP_PATH)) {
      fs.unlinkSync(ZIP_PATH);
    }
    
    // Cleanup macOS garbage
    const macOsDir = path.join(FONT_DIR, '__MACOSX');
    if (fs.existsSync(macOsDir)) {
      fs.rmSync(macOsDir, { recursive: true, force: true });
    }
    
    console.log('✨ Fonts installed successfully!');
    process.exit(0); // <--- This forces the script to stop waiting and lets pnpm continue

  } catch (error) {
    console.error('❌ Error in font setup:', error);
    process.exit(1); // Exit with error code so build fails if fonts are critical
  }
}

main();

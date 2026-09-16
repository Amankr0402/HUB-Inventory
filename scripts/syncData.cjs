const fs = require('fs');
const path = require('path');
const https = require('https');

const SUMMARY_URL = 'https://metabase-bkp.theelefant.ai/public/question/4288db2b-326f-4e4b-9740-0d2446c827c1.csv';
const DETAIL_URL = 'https://metabase-bkp.theelefant.ai/public/question/c1fe3252-e3b1-4117-959c-aa37271cf059.csv';

const PUBLIC_DATA_DIR = path.resolve(__dirname, '../public/data');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return download(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: HTTP ${response.statusCode}`));
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          const stats = fs.statSync(dest);
          resolve(stats.size);
        });
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function sync() {
  if (!fs.existsSync(PUBLIC_DATA_DIR)) {
    fs.mkdirSync(PUBLIC_DATA_DIR, { recursive: true });
  }

  console.log('🔄 Fetching latest live data from Metabase...');
  try {
    const summaryDest = path.join(PUBLIC_DATA_DIR, 'summary.csv');
    const detailDest = path.join(PUBLIC_DATA_DIR, 'detail.csv');

    console.log('⏳ Downloading summary.csv...');
    const summarySize = await download(SUMMARY_URL, summaryDest);
    console.log(`✅ summary.csv updated (${(summarySize / 1024).toFixed(1)} KB)`);

    console.log('⏳ Downloading detail.csv...');
    const detailSize = await download(DETAIL_URL, detailDest);
    console.log(`✅ detail.csv updated (${(detailSize / (1024 * 1024)).toFixed(2)} MB)`);

    console.log('🎉 Live data sync complete!');
  } catch (err) {
    console.error('❌ Sync failed:', err.message);
    process.exit(1);
  }
}

sync();

import fs from 'fs';
import path from 'path';

const MANDAL_SEARCHES = [
  { name: 'tambdi_idol.jpg', query: 'Tambdi Jogeshwari Ganpati' },
  { name: 'tambdi_temple.jpg', query: 'Tambdi Jogeshwari temple Pune' },
  { name: 'guruji_idol.jpg', query: 'Guruji Talim Ganpati Pune' },
  { name: 'kesariwada_idol.jpg', query: 'Kesariwada Ganpati' },
  { name: 'kesariwada_wada.jpg', query: 'Kesari Wada Pune' },
  { name: 'mandai_idol.jpg', query: 'Akhil Mandai Ganpati' },
  { name: 'mandai_temple.jpg', query: 'Mahatma Phule Mandai Pune' },
  { name: 'ganeshgalli_idol.jpg', query: 'Ganesh Galli Mumbaicha Raja' },
  { name: 'ganeshgalli_pandal.jpg', query: 'Ganesh Galli pandal' },
  { name: 'khetwadi_idol.jpg', query: 'Khetwadicha Raja Mumbai' },
  { name: 'andheri_idol.jpg', query: 'Andhericha Raja' },
  { name: 'chinchpokli_idol.jpg', query: 'Chinchpokli Chintamani' },
  { name: 'tejukaya_idol.jpg', query: 'Tejukaya Ganpati' },
];

async function searchCommons(query) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url|size&format=json`;
  const res = await fetch(url, { headers: { 'User-Agent': 'GodsEyeView/1.0 (dev@festival.org)' } });
  const data = await res.json();
  const pages = Object.values(data.query?.pages || {});
  for (const p of pages) {
    const info = p.imageinfo?.[0];
    if (info && info.url && !info.url.endsWith('.svg') && !info.url.endsWith('.ogg')) {
      return info.url;
    }
  }
  return null;
}

async function downloadFile(url, destPath) {
  const res = await fetch(url, { headers: { 'User-Agent': 'GodsEyeView/1.0 (dev@festival.org)' } });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(destPath, buffer);
  console.log(`Saved ${destPath} (${buffer.length} bytes)`);
}

async function main() {
  const outDir = path.resolve('public/images/mandals');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (const item of MANDAL_SEARCHES) {
    const dest = path.join(outDir, item.name);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 10000) {
      console.log(`Already exists: ${item.name}`);
      continue;
    }

    try {
      console.log(`Searching: ${item.query}`);
      let imgUrl = await searchCommons(item.query);
      if (!imgUrl) {
        // Fallback search with broader terms
        const fallbackQuery = item.query.split(' ')[0] + ' Ganpati';
        imgUrl = await searchCommons(fallbackQuery);
      }

      if (imgUrl) {
        console.log(`Found: ${imgUrl}`);
        await downloadFile(imgUrl, dest);
      } else {
        console.warn(`No image found for ${item.query}`);
      }
    } catch (err) {
      console.error(`Error downloading ${item.name}:`, err.message);
    }
  }
}

main();

import assert from 'node:assert/strict';
import fs from 'node:fs';
const city = "kosai";
let html;
if (city === 'morimachi') {
  html = fs.readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
} else {
  const {default: worker} = await import('../src/index.js');
  const response = await worker.fetch(new Request('https://' + city + 'alb.atawi.link/'), {});
  assert.equal(response.status, 200);
  html = await response.text();
}
const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1];
assert.ok(main?.includes('pf-home'), 'Homepage must render');
const images = [...main.matchAll(/<img\b[^>]*\ssrc="([^"]+)"/g)].map(m => m[1]);
const sources = main.match(/<details class="pf-more pf-sources">([\s\S]*?)<\/details>/)?.[1];
assert.ok(sources, 'Cover sources must remain accessible');
const ids = [...sources.matchAll(/href="\/photos\/([^/]+)\/#source"/g)].map(m => m[1]);
assert.ok(images.length > 1, 'Hero and photo banners must remain');
assert.equal(new Set(images).size, images.length, 'No duplicate hero/banner image URLs');
assert.equal(new Set(ids).size, ids.length, 'No duplicate hero/banner photo records');
assert.equal(ids.length, images.length, 'Every cover has a source link');
console.log(`PASS ${city}: ${images.length} unique homepage photographs with sources`);

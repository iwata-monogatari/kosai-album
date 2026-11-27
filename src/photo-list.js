import { describe } from './feature-gallery.js';

const tagsByPhoto = new WeakMap();
const orderCache = new WeakMap();
const normalize = text => String(text || '').normalize('NFKC').replace(/國/g, '国').replace(/ヶ/g, 'ケ');

export function listingTags(photo) {
  if (tagsByPhoto.has(photo)) return tagsByPhoto.get(photo);
  const { kind, tone } = describe(photo);
  const title = normalize(photo.title);
  const theme = normalize(photo.theme || photo.category);
  const aerial = kind === 'aerial' || /^gsi-/.test(photo.id || '') || /空中写真|航空写真|空から|上空/.test(theme);
  const subject = aerial ? 'aerial'
    : /鳥居|山門/.test(title) ? 'gate'
    : /社殿|拝殿|本堂|本殿|舞殿/.test(title) ? 'temple-building'
    : /紅葉|黄葉|モミジ|カエデ|神木|杉並木/.test(title) ? 'trees'
    : /線路|踏切/.test(title) ? 'tracks'
    : /駅名標|駅名板/.test(title) ? 'station-sign'
    : /キハ\d+|\bTH\d+\b|\bC\d{2}\b/i.test(title) ? 'train'
    : kind || (/駅(?:[（\s]|$)/.test(title) ? 'station' : theme);
  const place = normalize(photo.subjectLocation || photo.place || photo.area)
    .replace(/^現在の/, '').replace(/\s/g, '').replace(/(?:の?付近|の?周辺|地内)$/, '');
  const location = /^(?:[^（・]+市(?:内)?|森町(?:内)?)$/.test(place) ? '' : place;
  const caption = title.replace(/[（(][^）)]*[）)]/g, '')
    .replace(/^(?:\d{4}|(?:明治|大正|昭和|平成|令和)(?:元|\d+))年[の：:｜|\s]*/, '').trim();
  const tags = [location, subject, theme, caption, photo.year || '', tone || (photo.colorPeriod || photo.colorAlbum ? 'color' : '')];
  tagsByPhoto.set(photo, tags);
  return tags;
}

export function listingSimilarity(a, b) {
  const [place, subject, theme, caption, year, tone] = a;
  return (place && place === b[0] ? 6 : 0)
    + (subject && subject === b[1] ? 5 : 0)
    + (theme && theme === b[2] ? 2 : 0)
    + (caption.length >= 3 && caption === b[3] ? 8 : 0)
    + (subject === 'aerial' && b[1] === 'aerial' && year && year === b[4] ? 3 : 0)
    + (tone && tone === b[5] ? 1 : 0);
}

function weight(index, distance) {
  if (distance === 1) return 4 + (index % 2 ? 1 : 0) + (index % 3 ? 1 : 0);
  if (distance === 2) return index % 3 === 2 ? 4 : 2;
  return 1;
}

function nearCost(entries, entry, index) {
  let penalty = 0;
  for (let distance = 1; distance <= Math.min(index, 3); distance++) {
    penalty += weight(index, distance) * listingSimilarity(entry.tags, entries[index - distance].tags);
  }
  return penalty;
}

// Choose from nearby archive entries and evenly spaced entries farther ahead.
// Page boundaries and grid row boundaries use the same complete order.
export function orderPhotoResults(items, describeItem = listingTags) {
  if (items.length < 3) return items;
  const entries = items.map(item => ({ item, tags: describeItem(item) }));
  const pending = entries.slice(1);
  const ordered = [entries[0]];
  const subjectsLeft = new Map();
  for (const entry of pending) {
    const key = entry.tags[1];
    subjectsLeft.set(key, (subjectsLeft.get(key) || 0) + 1);
  }
  let newCost = 0;
  while (pending.length) {
    const index = ordered.length;
    const nearby = Math.min(16, pending.length);
    const distant = Math.min(12, pending.length - nearby);
    let best = 0, cost = Infinity, remaining = -1;
    for (let i = 0; i < nearby + distant; i++) {
      const candidate = i < nearby ? i : nearby + Math.floor((i - nearby + 1) * (pending.length - nearby) / (distant + 1));
      const entry = pending[candidate];
      const penalty = nearCost(ordered, entry, index);
      const frequency = subjectsLeft.get(entry.tags[1]);
      if (penalty < cost || (penalty === cost && frequency > remaining)) {
        best = candidate;
        cost = penalty;
        remaining = frequency;
      }
    }
    const [entry] = pending.splice(best, 1);
    ordered.push(entry);
    newCost += cost;
    subjectsLeft.set(entry.tags[1], remaining - 1);
  }
  const originalCost = entries.reduce((sum, entry, index) => sum + nearCost(entries, entry, index), 0);
  return newCost < originalCost ? ordered.map(entry => entry.item) : items;
}

export function uniquePhotoResults(photos) {
  const ids = new Set();
  const assets = new Set();
  return photos.filter(photo => {
    const asset = photo.imageRanges?.['480']?.sha256 || photo.thumb || photo.image;
    if (ids.has(photo.id) || (asset && assets.has(asset))) return false;
    ids.add(photo.id);
    if (asset) assets.add(asset);
    return true;
  });
}

export function arrangedListing(catalogue, params, filterKeys, matches) {
  if (!orderCache.has(catalogue)) orderCache.set(catalogue, new Map());
  const cache = orderCache.get(catalogue);
  const key = JSON.stringify(filterKeys.map(field => params.get(field) || ''));
  if (!cache.has(key)) {
    const photos = uniquePhotoResults(matches());
    const words = normalize(params.get('q')).toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (words.length) {
      const match = photos.findIndex(photo => {
        const title = normalize(photo.title).toLowerCase();
        return words.every(word => title.includes(word));
      });
      if (match > 0) photos.unshift(...photos.splice(match, 1));
    }
    const sorted = orderPhotoResults(photos);
    if (cache.size === 24) cache.delete(cache.keys().next().value);
    cache.set(key, sorted);
  }
  return cache.get(key);
}

import {describe, likeness} from './feature-gallery.js';

const albums = new WeakMap();
const descriptions = new WeakMap();

function tags(photo) {
  if (!descriptions.has(photo)) {
    const entry = describe(photo);
    const title = photo.title || '';
    if (/\bTH\d{3,}\b|キハ\d+|\bC\d{2}\b/i.test(title)) entry.kind = 'train';
    if (!entry.kind && /駅$/.test(title)) entry.kind = 'station';
    descriptions.set(photo, entry);
  }
  return descriptions.get(photo);
}

function similar(a, b) {
  const left = tags(a);
  const right = tags(b);
  const repeatedTitle = a.title && a.title === b.title;
  return likeness(left, right) + (repeatedTitle ? 7 : 0);
}

function comparison(photo) {
  if (photo.collection === '掛川祭と商店街') return photo.collection;
  if (photo.sourceList && photo.type === '空中写真') return `${photo.collection}:${photo.title}`;
  return '';
}

function albumKey(photo) {
  return comparison(photo) || photo.collection || '';
}

function varietyCost(photo, previous, twoBack) {
  return (previous ? 3 * similar(photo, previous) : 0) + (twoBack ? 2 * similar(photo, twoBack) : 0);
}

function arrange(photos) {
  if (photos.length <= 2 || comparison(photos[0])) return photos;
  const pending = photos.slice(1);
  const ordered = [photos[0]];
  while (pending.length) {
    const previous = ordered.at(-1);
    const twoBack = ordered.at(-2);
    const nearby = Math.min(20, pending.length);
    // Try the next archive entries and representative points farther ahead.
    const indices = Array.from({length: nearby}, (_, index) => index);
    for (let step = 1; step <= 12 && pending.length > nearby; step++) {
      const index = nearby + Math.floor((pending.length - nearby - 1) * step / 12);
      if (index > indices.at(-1)) indices.push(index);
    }
    let best = 0;
    let penalty = Infinity;
    for (const index of indices) {
      const candidate = varietyCost(pending[index], previous, twoBack);
      if (candidate < penalty) {
        best = index;
        penalty = candidate;
      }
    }
    ordered.push(pending.splice(best, 1)[0]);
  }
  const cost = list => list.reduce((sum, photo, index) => sum + varietyCost(photo, list[index - 1], list[index - 2]), 0);
  return cost(ordered) < cost(photos) ? ordered : photos;
}

export function photoAlbum(available, current) {
  if (!albums.has(available)) albums.set(available, new Map());
  const cache = albums.get(available);
  const key = albumKey(current);
  if (!cache.has(key)) {
    const unique = new Map();
    for (const photo of available) {
      if (albumKey(photo) === key && !unique.has(photo.id)) unique.set(photo.id, photo);
    }
    const photos = arrange([...unique.values()]);
    const indices = new Map(photos.map((photo, index) => [photo.id, index]));
    const titles = new Map();
    for (const photo of photos) titles.set(photo.title, (titles.get(photo.title) || 0) + 1);
    cache.set(key, {photos, indices, titles});
  }
  const album = cache.get(key);
  const index = album.indices.get(current.id) ?? -1;
  return {photos: album.photos, index, previous: index > 0 ? album.photos[index - 1] : undefined,
    next: index >= 0 ? album.photos[index + 1] : undefined,
    label(photo) {
      const date = photo.dateLabel || photo.date || '';
      return (album.titles.get(photo.title) || 0) > 1 && date && !photo.title.includes(date)
        ? `${photo.title}（${date}）` : photo.title;
    }};
}

export function relatedPhotographs(candidates, current, blocked = [], count = 3) {
  const seen = new Set([current.id, ...blocked.filter(Boolean).map(photo => photo.id)]);
  const remaining = candidates.filter(photo => {
    if (seen.has(photo.id)) return false;
    seen.add(photo.id);
    return true;
  });
  const selected = [];
  while (remaining.length && selected.length < count) {
    let best = 0;
    let high = -Infinity;
    for (const [index, photo] of remaining.entries()) {
      const relevance = (photo.collection === current.collection ? 4 : 0) + (tags(photo).place && tags(photo).place === tags(current).place ? 3 : 0);
      const repetition = selected.reduce((sum, other) => sum + similar(photo, other), 0);
      if (relevance - repetition > high) {
        best = index;
        high = relevance - repetition;
      }
    }
    selected.push(remaining.splice(best, 1)[0]);
  }
  return selected;
}

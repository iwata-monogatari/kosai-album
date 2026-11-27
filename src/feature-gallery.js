// Order the photographs in the gallery, while keeping each caption and source attached.
const subjects = [
  ['aerial', /空中写真|航空写真|上空|空から|機窓|^aerial$/i],
  ['train', /車両|新幹線|蒸気機関車|列車|赤電|気動車|電車|トロッコ|鉄道車両/],
  ['platform', /ホーム|改札|のりば|乗り場|切符|きっぷ|跨線橋|自由通路/],
  ['roadwork', /工事|建設|建設中|架設|排水機場|復旧/],
  ['festival-float', /屋台|山車|祢里|神輿|御殿屋台/],
  ['festival-people', /祭|行列|凧|踊り|獅子|神事|御櫃|お櫃|法被|奴道中/],
  ['station', /駅舎|停車場|駅入口|駅前|駅北口|駅南口|駅構内|駅正面|[北南]口の外観/],
  ['flood', /冠水|浸水|水害|洪水|増水|堤防/],
  ['lighthouse', /灯台|燈台/],
  ['interior', /室内|店内|座敷|展示室|教室|営業室|帳場|内部|工場の中|作業場|機械/],
  ['waterfront', /砂浜|水面|湖畔|海岸|海辺|河原|湖岸|川沿い|海水浴|波打ち際|浜辺/],
  ['boat', /漁船|漁業|釣り|船着|和船|漁労|入港|フェリー|旅客船/],
  ['port', /岸壁|防波堤|ふ頭|埠頭|桟橋|港湾|漁港/],
  ['castle', /天守|城跡|城址|城趾|櫓|御殿|石垣/],
  ['faith', /鳥居|山門|神社|社殿|拝殿|本堂|参道|寺院|三重塔|石段/],
  ['fields', /茶畑|水田|田園|田畑|畑|花畑|牧場/],
  ['shop', /店舗|百貨店|商店|店先|商店街|市場|呉服店|旅館/],
  ['street', /街道|町並み|街並み|市街|交差点|住宅地|通り|道路/],
  ['bridge', /橋|高架|渡し/],
  ['landscape', /遠望|遠景|風景|眺め|見下ろ|見渡|山あい|丘陵|岬/],
  ['building', /外観|建物|庁舎|校舎|図書館|資料館|正門|工場|全景/],
  ['people', /人々|作業|仕事|集合|職人|茶揉み|茶摘み|働く/],
];

function describe(photo) {
  const title = photo.title || '';
  const aerial = /空中写真|航空写真|^aerial$/i.test(`${photo.type || ''} ${photo.collection || ''}`.trim());
  const primary = aerial ? 'aerial' : subjects.find(([, match]) => match.test(title))?.[0];
  const kind = primary || subjects.find(([, match]) => match.test(photo.alt || photo.caption || ''))?.[0] || '';
  const place = String(photo.subjectLocation || photo.place || photo.area || '')
    .normalize('NFKC').replace(/（[^）]*）|\([^)]*\)/g, '').replace(/\s+/g, '').replace(/周辺$|付近$/, '');
  const theme = photo.theme || '';
  const tone = photo.color || photo.colorMode || '';
  return { photo, place, kind, theme, tone };
}

function likeness(a, b) {
  const samePlace = a.place.length >= 2 && a.place === b.place;
  const sameSubject = a.kind && a.kind === b.kind;
  return (samePlace ? 6 : 0) + (sameSubject ? 6 : 0)
    + (a.theme && a.theme === b.theme ? 2 : 0) + (a.tone && a.tone === b.tone ? 1 : 0);
}

function score(left, right) {
  // The same order serves the phone list and desktop grids with two or three columns.
  return right.reduce((total, photo, index) => total + likeness(left, photo) * [4, 3, 2][index], 0);
}

function spread(entries, preceding = []) {
  const remaining = entries.slice();
  const placed = [];
  while (remaining.length) {
    const nearby = preceding.concat(placed).slice(-3).reverse();
    let choice = 0;
    let lowest = Infinity;
    for (const [index, entry] of remaining.entries()) {
      const penalty = score(entry, nearby);
      if (penalty < lowest) {
        choice = index;
        lowest = penalty;
      }
    }
    placed.push(remaining.splice(choice, 1)[0]);
  }
  const sum = (list) => list.reduce((total, photo, index) =>
    total + score(photo, preceding.concat(list.slice(0, index)).slice(-3).reverse()), 0);
  return sum(placed) < sum(entries) ? placed : entries;
}

function orderedSamples(entries, count) {
  return Array.from({length:count}, (_, n) => entries[Math.round(n * (entries.length-1) / (count-1))]);
}

export function createFeatureGallery(renderGrid) {
  const seen = new Set();
  let preceding = [];
  return (photos, {chronological = false, expanded = false} = {}) => {
    const entries = [];
    for (const photo of photos) {
      if (!photo || seen.has(photo.id)) continue;
      seen.add(photo.id);
      entries.push(describe(photo));
    }
    if (!entries.length) return '';
    const ordered = chronological ? entries : spread(entries, preceding);
    const showAll = expanded || entries.length <= 12;
    const first = showAll ? ordered : chronological ? orderedSamples(ordered, 6) : ordered.slice(0, 6);
    preceding = preceding.concat(first).slice(-3);
    const lead = renderGrid(first.map(entry => entry.photo));
    if (showAll) return lead;
    const shown = new Set(first);
    const more = ordered.filter(entry => !shown.has(entry));
    return `${lead}<details class="feature-photo-more" style="margin-block:1rem">
      <summary>${chronological ? 'ほかの写真を順に見る' : 'ほかの写真を見る'}（${more.length}点）</summary>
      ${renderGrid(more.map(entry => entry.photo))}
    </details>`;
  };
}

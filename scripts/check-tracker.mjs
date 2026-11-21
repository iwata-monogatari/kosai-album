import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createContext, runInContext } from 'node:vm';
import { layout } from '../src/gallery.js';
import worker from '../src/index.js';

const origin = 'https://kosaialb.atawi.link';
const endpoint = 'https://fujigaoka-analytics-worker.hiroyukio0122.workers.dev';
const script = await readFile('public/album-tracker.js', 'utf8');
const env = { ASSETS: { fetch: async req => {
  assert.equal(new URL(req.url).pathname, '/album-tracker.js');
  return new Response(script,{headers:{'content-type':'application/javascript'}});
}}};
const asset = await worker.fetch(new Request(origin+'/album-tracker.js'),env);
assert.equal(asset.status,200);
assert.match(asset.headers.get('content-type'),/javascript/);
assert.equal(await asset.text(),script);
const trackerCount = html => (html.match(/<script defer src="\/album-tracker.js" data-site="atawi-kosaialb"><\/script>/g) || []).length;
for (const path of ['/', '/photos/', '/features/kosai-station/', '/library/', '/creator/', '/about/', '/usage/', '/privacy/', '/photos/tokaido-bridge/']) {
  const response = await worker.fetch(new Request(origin + path), {});
  assert.equal(response.status, 200, path);
  const html = await response.text();
  assert.equal(trackerCount(html), 1, path);
  assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
  assert.equal(trackerCount(layout('Private', path, '', { private: true })), 0);
}
for (const path of ['/okuru/', '/contact/', '/review/', '/review/preview', '/admin/', '/photos/nonexistent/', '/sitemap.xml', '/api/unknown', '/admin/login/', '/media/unknown']) {
  const response = await worker.fetch(new Request(origin + path), {});
  assert.equal(trackerCount(await response.text()), 0, path);
}

function browser(url, options = {}) {
  const requests = [];
  const listeners = new Map();
  const storage = new Map(Object.entries(options.storage || {}));
  const location = new URL(url);
  const document = {
    querySelectorAll: () => options.creatorLinks || [],
    currentScript: { src: origin + '/album-tracker.js', getAttribute: () => 'atawi-kosaialb' },
    referrer: options.referrer || '', title: '写真を探す', cookie: '',
    addEventListener: (name, fn) => listeners.set(name, fn)
  };
  const navigator = { webdriver: options.automated || false, userAgent: 'Mozilla/5.0 Chrome/142.0.0.0 Safari/537.36' };
  const localStorage = { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) };
  const window = { location, navigator, localStorage, fetch: true,
    history:{state:null,replaceState:(_,__,url)=>{location.href=new URL(url,location).href;}},
    performance:{getEntriesByType:()=>[{type:options.navigation || 'navigate'}]}
  };
  const context = createContext({ window, document, navigator, URL, URLSearchParams, Blob,
    fetch: (url, init) => { assert.equal(init.method, 'POST'); requests.push({ url, payload: JSON.parse(init.body) }); return Promise.resolve({ status: 202 }); }
  });
  const run = () => runInContext(script, context);
  run();
  return { requests, window, listeners, run };
}

const page = browser(origin + '/photos/?q=テスト語#確認', { referrer: 'https://example.org/review/private?token=secret#personal' });
assert.equal(page.requests.length, 1);
assert.deepEqual(page.requests[0], { url: endpoint + '/api/collect', payload: {
  site_id: 'atawi-kosaialb', path: '/photos/', url: origin + '/photos/', title: '写真を探す', referrer: 'https://example.org'
} });
page.run();
assert.equal(page.requests.length, 1, 'A duplicate script must not send another pageview');
page.window.fgaTrack('mail_click');
assert.equal(page.requests[1].url, endpoint + '/api/click');
assert.equal(page.requests[1].payload.url, origin + '/photos/');
assert.equal(page.requests[1].payload.referrer, 'https://example.org');
const clickTarget = {
  matches: selector => selector === '[data-track-click]',
  getAttribute: name => name === 'data-track-click' ? 'source_click' : null,
  value: 'private-value'
};
page.listeners.get('click')({ target: clickTarget });
assert.equal(page.requests[2].payload.event_name, 'source_click');
assert(!JSON.stringify(page.requests).includes('private'));
assert.equal(page.requests.filter(row => row.url.endsWith('/api/collect')).length, 1);

const nextPage = browser(origin + '/photos/tokaido-bridge/');
for (const source of ['/', '/photos/', '/features/kosai-station/', '/library/', '/about/', '/usage/', '/privacy/', '/photos/tokaido-bridge/']) {
  const link = new URL('/creator/', origin);
  browser(origin + source + '?q=private#search', {creatorLinks:[link]});
  assert.equal(link.referrerPolicy, 'origin');
  const landed = browser(link.href, {referrer:origin+'/'});
  assert.equal(landed.requests.length, 1);
  assert.equal(landed.requests[0].payload.referrer,origin+source);
  assert.equal(landed.window.location.href,origin+'/creator/');
  assert.equal(landed.requests[0].payload.url, origin+'/creator/');
  assert.equal(browser(link.href,{referrer:'https://example.com/x'}).requests[0].payload.referrer,'https://example.com');
  assert.equal(browser(link.href,{referrer:origin+'/', navigation:'reload'}).requests[0].payload.referrer,origin);
}
for (const source of ['/admin/', '/okuru/', '/creator/', '/photos/?q=private', '/photos/a/b/', '//example.org/']) {
  const r = browser(origin+'/creator/#album-from='+encodeURIComponent(source), {referrer:origin+'/'});
  assert.equal(r.requests[0].payload.referrer,origin);
}
assert.equal(browser(origin+'/creator/').requests[0].payload.referrer,'');
const creatorView = browser(origin + '/creator/');
const creatorHtml = await (await worker.fetch(new Request(origin + '/creator/'), {})).text();
const outgoing = Array.from(creatorHtml.matchAll(/<a\b[^>]*\bhref="(https?:\/\/[^"]+)"/g), match => match[1]);
const destinations = new Map([['oishi-hiroyuki.org','creator_official'], ['kosai.enshu-lifehack.com','creator_lifehack'], ['fudosan.atawi.link','creator_fudosan']]);
for (const host of destinations.keys()) assert(outgoing.some(href => new URL(href).hostname === host));
function follow(view, href) {
  const link = {matches: selector => selector === 'a[href]', getAttribute: key => key === 'href' ? href : ''};
  view.listeners.get('click')({target:{parentNode:link}});
}
for (const href of [...outgoing, '/photos/', 'https://oishi-hiroyuki.org.example.org/']) {
  const before = creatorView.requests.length;
  follow(creatorView, href);
  const expected = destinations.get(new URL(href,origin).hostname);
  assert.equal(creatorView.requests.length, before + (expected ? 1 : 0), href);
  if (expected) assert.deepEqual(creatorView.requests.at(-1), {url:endpoint+'/api/click', payload:{
    site_id:'atawi-kosaialb', path:'/creator/', url:origin+'/creator/', referrer:'', event_name:expected
  }});
}
follow(nextPage, 'https://fudosan.atawi.link/');
const creatorInternal = browser(origin + '/creator/?fga_internal=1');
follow(creatorInternal,'https://fudosan.atawi.link/?example=private#hash');
assert.equal(creatorInternal.requests.at(-1).payload.is_internal, true);
assert(!JSON.stringify(creatorInternal.requests).includes('example'));
creatorView.listeners.get('auxclick')({button:1,target:{closest:()=>({href:'https://fudosan.atawi.link/'})}});
assert.equal(creatorView.requests.at(-1).payload.event_name,'creator_fudosan');
assert.equal(creatorView.requests.filter(row=>row.url===endpoint+'/api/collect').length,1);
assert.equal(nextPage.requests.length, 1);
assert.equal(nextPage.requests[0].payload.path, '/photos/tokaido-bridge/');
const internal = browser(origin + '/photos/?q=secret&fga_internal=1#private');
assert.equal(internal.requests.length, 1);
assert.equal(internal.requests[0].payload.is_internal, true);
assert.equal(internal.requests[0].payload.internal_reason, 'internal_param');
assert.equal(internal.requests[0].payload.url, origin + '/photos/');
assert(!JSON.stringify(internal.requests).includes('secret'));
for (const url of ['http://localhost/', 'https://preview.iwata-album.pages.dev/', origin + '/?check=1', origin + '/?codex_chrome_check=1', origin + '/?fga_ignore=1']) {
  assert.equal(browser(url).requests.length, 0, url);
}
assert.equal(browser(origin, { automated: true }).requests.length, 0);
assert.equal(browser(origin, { storage: { fujigaokaAnalyticsIgnore: '1' } }).requests.length, 0);
assert.equal(browser(origin, { storage: { fujigaokaAnalyticsInternal: '1' } }).requests[0].payload.is_internal, true);
assert.equal(browser(origin, { referrer: 'data:text/plain,private' }).requests[0].payload.referrer, '');
console.log('PASS public-page tags, private-page exclusion, static route, one pageview, duplicate guard, sanitized click/pageview payloads, internal and ignore commands.');

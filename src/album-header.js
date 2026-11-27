// Shared photo-album masthead. Keep the three primary links visible at every width.
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function albumHeader({site, mark, area, theme, links, consult, path}) {
  const home = path === '/';
  const link = (href, label, cls = '') => `<a class="${cls}" href="${escape(href)}"${href === path ? ' aria-current="page"' : ''}${href.startsWith('https://') ? ' referrerpolicy="origin"' : ''}>${escape(label)}</a>`;
  return `<header class="album-header${home ? ' album-home' : ''}" data-place="${escape(theme)}">
    <div class="album-masthead">
      <a class="album-brand" href="/" aria-label="${escape(site)} ホーム">
        <span class="album-seal" aria-hidden="true">${escape(mark)}</span>
        <span class="album-wordmark"><span class="album-region">${escape(area)}の昔の写真</span><span class="album-name">${escape(site)}</span></span>
      </a>
      <nav class="album-actions" aria-label="作成者・寄稿・相談">
        ${link('/creator/', home ? '作成者' : '作成者・大石浩之', 'album-creator')}
        ${link('/okuru/', home ? '写真を送る' : '写真を寄稿する', 'album-contribute')}
        ${link(consult, home ? '住まいの相談' : '実家・空き家の相談', 'album-consult')}
      </nav>
    </div>
    ${home ? '<details class="album-menu"><summary>メニュー</summary>' : '<div class="album-browse-bar">'}<nav class="album-browse" aria-label="写真館をめぐる">${links.map(([href,label]) => link(href,label)).join('')}</nav>${home ? '</details>' : '</div>'}
  </header>`;
}

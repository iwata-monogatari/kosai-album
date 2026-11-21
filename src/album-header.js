// Shared photo-album masthead. Keep the three primary links visible at every width.
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function albumHeader({site, mark, area, theme, links, consult, path}) {
  const link = (href, label, cls = '') => `<a class="${cls}" href="${escape(href)}"${href === path ? ' aria-current="page"' : ''}${href.startsWith('https://') ? ' referrerpolicy="origin"' : ''}>${escape(label)}</a>`;
  return `<header class="album-header" data-place="${escape(theme)}">
    <div class="album-masthead">
      <a class="album-brand" href="/" aria-label="${escape(site)} ホーム">
        <span class="album-seal" aria-hidden="true">${escape(mark)}</span>
        <span class="album-wordmark"><span class="album-region">${escape(area)}の記憶を、一枚ずつ。</span><span class="album-name">${escape(site)}</span></span>
      </a>
      <nav class="album-actions" aria-label="作成者・寄稿・相談">
        ${link('/creator/', '作成者・大石浩之', 'album-creator')}
        ${link('/okuru/', '写真を寄稿する', 'album-contribute')}
        ${link(consult, '実家・空き家の相談', 'album-consult')}
      </nav>
    </div>
    <div class="album-browse-bar"><nav class="album-browse" aria-label="写真館をめぐる">${links.map(([href,label]) => link(href,label)).join('')}</nav></div>
  </header>`;
}

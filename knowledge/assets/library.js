(() => {
  const input = document.querySelector('#knowledge-search');
  const form = document.querySelector('.search-form');
  const list = document.querySelector('#article-list');
  const entries = [...list.children];
  const topics = [...document.querySelectorAll('[data-category-filter]')];
  const title = document.querySelector('#list-title');
  const count = document.querySelector('#result-count');
  const reset = document.querySelector('#reset-filters');
  const clear = document.querySelector('.search-clear');
  const activeTag = document.querySelector('#active-tag');
  let documents = null;
  const state = { q: '', category: '', tag: '' };
  const normalize = value => value.normalize('NFKC').toLocaleLowerCase();

  function readURL() {
    const params = new URLSearchParams(location.search);
    for (const key of Object.keys(state)) state[key] = params.get(key) || '';
    input.value = state.q;
  }

  function updateURL() {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(state)) if (value) params.set(key, value);
    history.replaceState(null, '', location.pathname + (params.size ? '?' + params : ''));
  }

  function filter() {
    const terms = normalize(state.q).trim().split(/\s+/).filter(Boolean);
    let visible = 0;
    const selectedTopic = topics.find(t => t.dataset.categoryFilter === state.category);
    for (const item of entries) {
      const article = documents?.get(item.dataset.url);
      const haystack = normalize(article ? [article.title, article.summary, article.source, article.tags.join(' '), article.text].join(' ') : item.textContent);
      const tags = JSON.parse(item.dataset.tags);
      const matches = (!state.category || item.dataset.category === state.category)
        && (!state.tag || tags.some(tag => normalize(tag) === normalize(state.tag)))
        && terms.every(term => haystack.includes(term));
      item.hidden = !matches;
      if (matches) visible++;
    }
    for (const topic of topics) {
      const selected = topic.dataset.categoryFilter === state.category;
      topic.classList.toggle('active', selected);
      if (selected) topic.setAttribute('aria-current', 'true');
      else topic.removeAttribute('aria-current');
    }
    title.textContent = state.category ? selectedTopic?.firstElementChild.textContent || '主题资料' : '全部资料';
    count.textContent = `${visible} 篇`;
    clear.hidden = !state.q;
    reset.hidden = !state.q && !state.category && !state.tag;
    activeTag.hidden = !state.tag;
    activeTag.textContent = state.tag ? `标签：${state.tag}` : '';
    document.querySelector('#empty-state').hidden = visible > 0;
  }

  function change(key, value) {
    state[key] = value;
    updateURL();
    filter();
  }

  function resetAll() {
    for (const key of Object.keys(state)) state[key] = '';
    input.value = '';
    updateURL();
    filter();
  }

  readURL();
  filter();
  for (const topic of topics) topic.addEventListener('click', event => {
    // Native navigation remains available for new tabs and without JavaScript.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    change('category', topic.dataset.categoryFilter);
  });
  list.addEventListener('click', event => {
    const link = event.target.closest('[data-tag]');
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    change('tag', link.dataset.tag);
  });
  reset.addEventListener('click', resetAll);
  document.querySelector('#empty-reset').addEventListener('click', resetAll);
  clear.addEventListener('click', () => { input.value = ''; change('q', ''); input.focus(); });
  input.addEventListener('input', () => change('q', input.value));
  form.addEventListener('submit', event => { event.preventDefault(); change('q', input.value); });
  window.addEventListener('popstate', () => { readURL(); filter(); });

  fetch('/knowledge/search.json').then(response => {
    if (!response.ok) throw new Error(`Search index: ${response.status}`);
    return response.json();
  }).then(data => {
    documents = new Map(data.articles.map(article => [article.url, article]));
    form.hidden = false;
    document.querySelector('#search-help').hidden = false;
    filter();
  }).catch(() => {
    // Article navigation and metadata filtering still work if the index is unavailable.
    form.hidden = false;
    const help = document.querySelector('#search-help');
    help.hidden = false;
    help.textContent = '全文索引暂时无法加载，当前可搜索标题、摘要和标签。刷新页面可重试。';
    filter();
  });
})();

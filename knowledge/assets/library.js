(() => {
  const input = document.querySelector('#knowledge-search');
  const form = document.querySelector('.search-form');
  const list = document.querySelector('#article-list');
  const entries = [...list.children];
  const topicFilter = document.querySelector('#topic-filter');
  const topicTrigger = document.querySelector('#topic-trigger');
  const topicMenu = document.querySelector('#topic-menu');
  const topics = [...topicFilter.querySelectorAll('[data-topic]')];
  const allTopics = topics.map(topic => topic.value);
  const selectAll = document.querySelector('#select-all-topics');
  const clearTopics = document.querySelector('#clear-topics');
  const selection = document.querySelector('#topic-selection');
  const title = document.querySelector('#list-title');
  const count = document.querySelector('#result-count');
  const reset = document.querySelector('#reset-filters');
  const clear = document.querySelector('.search-clear');
  const activeTag = document.querySelector('#active-tag');
  let documents = null;
  const state = { q: '', categories: new Set(allTopics), tag: '' };
  const normalize = value => value.normalize('NFKC').toLocaleLowerCase();
  let pendingRender = false;

  function setMenuOpen(open) {
    topicMenu.hidden = !open;
    topicTrigger.setAttribute('aria-expanded', String(open));
  }

  function readURL() {
    const params = new URLSearchParams(location.search);
    state.q = params.get('q') || '';
    state.tag = params.get('tag') || '';
    state.categories = params.has('category')
      ? new Set(params.getAll('category').filter(value => allTopics.includes(value)))
      : new Set(allTopics);
    input.value = state.q;
  }

  function updateURL() {
    const params = new URLSearchParams();
    if (state.q) params.set('q', state.q);
    if (state.categories.size !== allTopics.length) {
      if (!state.categories.size) params.append('category', '');
      else for (const category of allTopics) if (state.categories.has(category)) params.append('category', category);
    }
    if (state.tag) params.set('tag', state.tag);
    history.replaceState(null, '', location.pathname + (params.size ? '?' + params : ''));
  }

  function filter() {
    const terms = normalize(state.q).trim().split(/\s+/).filter(Boolean);
    let visible = 0;
    for (const item of entries) {
      const article = documents?.get(item.dataset.url);
      const haystack = normalize(article ? [article.title, article.summary, article.source, article.tags.join(' '), article.text].join(' ') : item.textContent);
      const tags = JSON.parse(item.dataset.tags);
      const matches = state.categories.has(item.dataset.category)
        && (!state.tag || tags.some(tag => normalize(tag) === normalize(state.tag)))
        && terms.every(term => haystack.includes(term));
      if (item.hidden === matches) item.hidden = !matches;
      if (matches) visible++;
    }
    const selected = topics.filter(topic => state.categories.has(topic.value));
    for (const topic of topics) topic.checked = state.categories.has(topic.value);
    const isAll = selected.length === allTopics.length;
    selectAll.setAttribute('aria-disabled', String(isAll));
    clearTopics.setAttribute('aria-disabled', String(!selected.length));
    selection.textContent = isAll ? '全部主题' : !selected.length ? '未选择主题'
      : selected.length === 1 ? selected[0].nextElementSibling.textContent : `${selected.length} 个主题`;
    topicTrigger.setAttribute('aria-label', `筛选主题：${selection.textContent}`);
    title.textContent = isAll ? '全部资料' : '筛选结果';
    count.textContent = `${visible} 篇`;
    clear.hidden = !state.q;
    reset.hidden = !state.q && isAll && !state.tag;
    activeTag.hidden = !state.tag;
    activeTag.textContent = state.tag ? `标签：${state.tag}` : '';
    document.querySelector('#empty-state').hidden = visible > 0;
  }

  function change(key, value) {
    state[key] = value;
    // Finish native input/focus handling before changing the surrounding UI.
    if (pendingRender) return;
    pendingRender = true;
    requestAnimationFrame(() => {
      pendingRender = false;
      updateURL();
      filter();
    });
  }

  function resetAll() {
    state.q = '';
    state.tag = '';
    state.categories = new Set(allTopics);
    input.value = '';
    updateURL();
    filter();
  }

  readURL();
  filter();
  form.hidden = false;
  topicFilter.hidden = false;
  topicTrigger.addEventListener('click', () => setMenuOpen(topicMenu.hidden));
  selectAll.addEventListener('click', () => {
    if (state.categories.size !== allTopics.length) change('categories', new Set(allTopics));
  });
  clearTopics.addEventListener('click', () => {
    if (state.categories.size) change('categories', new Set());
  });
  for (const topic of topics) topic.addEventListener('change', () => {
    change('categories', new Set(topics.filter(option => option.checked).map(option => option.value)));
  });
  document.addEventListener('pointerdown', event => {
    if (!topicMenu.hidden && !topicFilter.contains(event.target)) setMenuOpen(false);
  });
  topicFilter.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !topicMenu.hidden) {
      event.preventDefault();
      setMenuOpen(false);
      topicTrigger.focus();
    }
  });
  topicFilter.addEventListener('focusout', () => {
    requestAnimationFrame(() => {
      if (!topicFilter.contains(document.activeElement)) setMenuOpen(false);
    });
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
    filter();
  }).catch(() => {
    const error = document.querySelector('#search-error');
    error.hidden = false;
    error.textContent = '全文搜索暂不可用，当前仅搜索标题、摘要和标签。';
    filter();
  });
})();

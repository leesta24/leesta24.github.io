import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const site = 'https://leesta24.github.io';
const escape = (text = '') => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const slug = text => text.toLowerCase().replace(/[^\p{L}\p{N}\p{M}\s_-]/gu, '').replace(/\s/g, '-');
const plain = tokens => (tokens ?? []).map(t => t.type === 'image' ? t.content : t.children ? plain(t.children) : ['text', 'code_inline', 'html_inline'].includes(t.type) ? t.content : t.type === 'softbreak' ? ' ' : '').join('');
const md = new MarkdownIt({ html: false, linkify: true, highlight(code, language) {
  return language && hljs.getLanguage(language) ? hljs.highlight(code, { language, ignoreIllegals: true }).value : '';
}});

async function walk(root, prefix = '') {
  const entries = await fs.readdir(path.join(root, prefix), { withFileTypes: true });
  const paths = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
    if (entry.name.startsWith('.')) continue;
    const name = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) paths.push(...await walk(root, name));
    else if (entry.isFile()) paths.push(name);
  }
  return paths;
}

function route(file) {
  if (file === 'INDEX.md') return '/knowledge/archive/';
  if (file === 'source.md') return '/knowledge/sources/';
  return '/knowledge/' + file.replace(/(?:^|\/)README\.md$/, '/').replace(/\.md$/, '/').replace(/^\//, '');
}

function indexMetadata(markdown) {
  const metadata = new Map();
  let row;
  for (const token of md.parse(markdown, {})) {
    if (token.type === 'tr_open') row = [];
    if (token.type === 'inline' && row) row.push(token);
    if (token.type === 'tr_close') {
      const link = row[1]?.children?.find(t => t.type === 'link_open');
      if (/^\d{4}-\d{2}-\d{2}$/.test(row[0]?.content) && link) {
        metadata.set(decodeURIComponent(link.attrGet('href')), {
          date: row[0].content, title: plain(row[1].children), source: plain(row[2]?.children),
          tags: plain(row[3]?.children).split(/[,，、]/).map(s => s.trim()).filter(Boolean),
          summary: plain(row[4]?.children),
        });
      }
      row = null;
    }
  }
  return metadata;
}

function field(markdown, label) {
  return markdown.match(new RegExp(`^-\\s*(?:\\*\\*)?${label}(?:\\*\\*)?\\s*[:：]\\s*(.*)$`, 'm'))?.[1] ?? '';
}

function fallbackMetadata(markdown, file) {
  const summary = markdown.match(/^##\s+一句话摘要\s*\n+([^\n]+)/m)?.[1] ?? '';
  return { date: field(markdown, '归档日期').match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? path.basename(file).match(/^\d{4}-\d{2}-\d{2}/)?.[0] ?? '',
    tags: field(markdown, '标签').split(/[,，、]/).map(s => s.trim()).filter(Boolean), summary,
    source: field(markdown, '(?:来源|作者 / 发布方|作者)').replace(/\*\*/g, '') };
}

function navigation() {
  return `<a class="skip-link" href="#main">跳到正文</a><header class="site-header shell"><nav class="nav" aria-label="主导航"><a class="brand" href="/">Lest.</a><div class="nav-links"><a href="/#about">About</a><a href="/#projects">Projects</a><a href="/knowledge/" aria-current="page">Knowledge</a><a href="https://github.com/leesta24" rel="noreferrer">GitHub</a></div></nav></header>`;
}

function layout({ title, description, url, content, script = false }) {
  return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="${escape(description)}"><meta name="color-scheme" content="light dark"><title>${escape(title)} | Lest</title><link rel="canonical" href="${site}${url}"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:type" content="article"><meta property="og:url" content="${site}${url}"><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="preload" href="/assets/fonts/Geist-Variable.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="/knowledge/assets/knowledge.css"><link rel="stylesheet" href="/knowledge/assets/highlight-light.css" media="(prefers-color-scheme: light)"><link rel="stylesheet" href="/knowledge/assets/highlight-dark.css" media="(prefers-color-scheme: dark)">${script ? '<script src="/knowledge/assets/library.js" defer></script>' : ''}</head><body>${navigation()}${content}<footer class="footer shell"><span>Lest / Juyi Wu</span><a href="/knowledge/">Knowledge Base</a></footer></body></html>\n`;
}

function entry(article, categories) {
  const category = categories.get(article.category);
  return `<li class="entry" data-url="${escape(article.url)}" data-category="${escape(article.category)}" data-tags="${escape(JSON.stringify(article.tags))}"><div class="entry-date"><time datetime="${escape(article.date)}">${escape(article.date || '未注明日期')}</time><a class="entry-category" href="/knowledge/?category=${encodeURIComponent(article.category)}">${escape(category?.title ?? article.category)}</a></div><div class="entry-copy"><h3><a class="entry-title" href="${escape(article.url)}">${escape(article.title)}<span aria-hidden="true" class="entry-arrow">↗</span></a></h3><p class="entry-summary">${escape(article.summary)}</p><div class="entry-tags">${article.tags.map(t => `<a href="/knowledge/?tag=${encodeURIComponent(t)}" data-tag="${escape(t)}">${escape(t)}</a>`).join('')}</div></div></li>`;
}

export async function build(sourceDirectory, outputDirectory) {
  const source = path.resolve(sourceDirectory);
  const output = path.resolve(outputDirectory);
  // The output is replaceable generated content, never a repository or a source ancestor.
  if (output === source || source.startsWith(output + path.sep) || output.startsWith(source + path.sep) || path.basename(output) !== 'knowledge') {
    throw new Error('Output must be a separate generated directory named knowledge');
  }
  try { await fs.access(path.join(output, '.git')); throw new Error('Refusing to overwrite a repository'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }

  const materialFiles = await walk(path.join(source, 'materials'), '');
  const files = ['INDEX.md', 'source.md', ...materialFiles.filter(f => f.endsWith('.md')).map(f => 'materials/' + f)];
  const documents = new Map();
  for (const file of files) {
    const markdown = await fs.readFile(path.join(source, file), 'utf8');
    const tokens = md.parse(markdown, {});
    const heading = tokens.findIndex(t => t.type === 'heading_open' && t.tag === 'h1');
    const title = heading < 0 ? path.basename(file, '.md') : plain(tokens[heading + 1].children);
    documents.set(file, { file, markdown, title, tokens, url: route(file) });
  }
  const metadata = indexMetadata(documents.get('INDEX.md').markdown);
  const categories = new Map();
  for (const doc of documents.values()) {
    if (/^materials\/[^/]+\/README\.md$/.test(doc.file)) {
      const id = doc.file.split('/')[1];
      const description = doc.tokens.find(t => t.type === 'inline' && t.content !== doc.title)?.content ?? '';
      categories.set(id, { id, title: doc.title, description, url: doc.url });
    }
  }
  const articles = [...documents.values()].filter(d => d.file.startsWith('materials/') && path.basename(d.file) !== 'README.md').map(doc => {
    const category = doc.file.split('/')[1];
    if (!categories.has(category)) categories.set(category, { id: category, title: category, description: '', url: `/knowledge/?category=${encodeURIComponent(category)}` });
    return { ...fallbackMetadata(doc.markdown, doc.file), ...metadata.get(doc.file), file: doc.file, url: doc.url, category,
      title: metadata.get(doc.file)?.title || doc.title, text: doc.tokens.filter(t => t.type === 'inline' || t.type === 'fence' || t.type === 'code_block').map(t => t.children ? plain(t.children) : t.content).join('\n') };
  }).sort((a, b) => b.date.localeCompare(a.date) || a.file.localeCompare(b.file, 'en'));
  if (!articles.length) throw new Error('No articles found; refusing to publish an empty library');
  const attachments = materialFiles.filter(f => /\.(?:png|jpe?g|gif|webp|avif|pdf|txt|csv|mp3|mp4|wav|ogg)$/i.test(f)).map(f => 'materials/' + f);
  const attachmentSet = new Set(attachments);
  const urls = new Set([...documents.values()].map(d => d.url));
  if (urls.size !== documents.size) throw new Error('Conflicting document URLs');

  function rewrite(href, file) {
    if (!href || /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(href)) return href;
    const match = href.match(/^([^?#]*)(\?[^#]*)?(#.*)?$/);
    if (!match) throw new Error(`Invalid URL in ${file}: ${href}`);
    const target = path.posix.normalize(path.posix.join(path.posix.dirname(file), decodeURIComponent(match[1])));
    if (target.startsWith('../') || path.posix.isAbsolute(target)) throw new Error(`Unsafe content path in ${file}: ${href}`);
    const suffix = (match[2] || '') + (match[3] || '');
    if (documents.has(target)) return documents.get(target).url + suffix;
    if (attachmentSet.has(target)) return '/knowledge/' + target.split('/').map(encodeURIComponent).join('/') + suffix;
    if (target === 'AGENTS.md') return 'https://github.com/leesta24/knowledge-base/blob/main/AGENTS.md';
    throw new Error(`Missing or unpublished local link in ${file}: ${href}`);
  }

  // Validate and render everything before replacing the last successful build.
  const pages = [];
  for (const doc of documents.values()) {
    const tokens = md.parse(doc.markdown, {});
    const headings = [];
    const usedIds = new Set(['main']);
    let seenTitle = false;
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type === 'heading_open') {
        if (tokens[i].tag === 'h1') {
          if (seenTitle) { tokens[i].tag = 'h2'; tokens[i + 2].tag = 'h2'; }
          seenTitle = true;
        }
        const text = plain(tokens[i + 1].children);
        const base = slug(text) || 'section';
        let id = base;
        let n = 0;
        while (usedIds.has(id)) id = `${base}-${++n}`;
        usedIds.add(id);
        tokens[i].attrSet('id', id);
        if (['h2', 'h3'].includes(tokens[i].tag)) headings.push({ id, text, level: tokens[i].tag });
      }
      for (const child of tokens[i].children ?? []) {
        if (child.type === 'link_open') {
          child.attrSet('href', rewrite(child.attrGet('href'), doc.file));
          if (/^https?:/.test(child.attrGet('href'))) child.attrSet('rel', 'noreferrer');
          if (child.attrGet('href').endsWith('/AGENTS.md')) child.attrSet('title', '维护规则位于私有源仓库');
        }
        if (child.type === 'image') {
          child.attrSet('src', rewrite(child.attrGet('src'), doc.file));
          child.attrSet('loading', 'lazy');
        }
      }
      if (tokens[i].type === 'table_open') { tokens[i].type = 'html_block'; tokens[i].content = '<div class="table-wrap"><table>\n'; }
      if (tokens[i].type === 'table_close') { tokens[i].type = 'html_block'; tokens[i].content = '</table></div>\n'; }
    }
    const firstHeading = tokens.findIndex(t => t.type === 'heading_open' && t.tag === 'h1');
    const titleId = firstHeading >= 0 ? tokens[firstHeading].attrGet('id') : 'document-title';
    if (firstHeading >= 0) tokens.splice(firstHeading, 3);
    const article = articles.find(a => a.file === doc.file);
    const category = categories.get(doc.file.split('/')[1]);
    const rendered = md.renderer.render(tokens, md.options, {});
    const rawUrl = '/knowledge/raw/' + doc.file.split('/').map(encodeURIComponent).join('/');
    const related = article ? articles.filter(a => a.category === article.category && a.file !== doc.file).slice(0, 3) : [];
    const content = `<main id="main" class="shell reading-layout"><div class="reading-main"><nav class="breadcrumb" aria-label="面包屑"><a href="/knowledge/">知识库</a>${category ? `<span aria-hidden="true">/</span><a href="${category.url}">${escape(category.title)}</a>` : ''}</nav><header class="article-header"><p class="eyebrow">${article ? '阅读笔记' : '知识库目录'}</p><h1 id="${escape(titleId)}">${escape(doc.title)}</h1><div class="article-meta">${article?.date ? `<time datetime="${article.date}">归档于 ${article.date}</time>` : ''}<a href="${rawUrl}" download>下载 Markdown ↓</a></div>${article ? `<div class="entry-tags">${article.tags.map(t => `<a href="/knowledge/?tag=${encodeURIComponent(t)}">${escape(t)}</a>`).join('')}</div>` : ''}</header><article class="prose">${rendered}</article>${related.length ? `<section class="related"><h2>同主题阅读</h2><ul>${related.map(a => `<li><a href="${a.url}">${escape(a.title)} <span aria-hidden="true">↗</span></a></li>`).join('')}</ul></section>` : ''}<a class="back-link" href="/knowledge/">← 返回全部资料</a></div><aside class="toc" aria-label="本文目录"><details open><summary>本文目录</summary><nav>${headings.map(h => `<a class="${h.level}" href="#${encodeURIComponent(h.id)}">${escape(h.text)}</a>`).join('')}</nav></details></aside></main>`;
    pages.push({ url: doc.url, html: layout({ title: doc.title, description: article?.summary || doc.title, url: doc.url, content }), doc });
  }

  const topicLinks = [...categories.values()].map(c => {
    const count = articles.filter(a => a.category === c.id).length;
    return `<a class="topic-link" href="${escape(c.url)}" data-category-filter="${escape(c.id)}"><span>${escape(c.title)}</span><span class="topic-count">${count}</span></a>`;
  }).join('');
  const content = `<main id="main" class="shell"><section class="library-intro"><div><p class="eyebrow">Lest 的个人知识库</p><h1>Knowledge Base<span class="title-period">.</span></h1></div><div class="intro-copy"><p>把读过的资料，变成可以反复查阅的知识。</p><p class="muted">关于 AI、Agent 与软件工程的技术资料、阅读笔记和架构调研。</p><div class="library-stats"><span><strong>${articles.length}</strong> 篇资料</span><span><strong>${categories.size}</strong> 个主题</span></div></div></section><section class="library-layout" aria-label="知识库资料"><aside class="topics"><h2>按主题浏览</h2><nav aria-label="主题分类"><a class="topic-link active" href="/knowledge/" data-category-filter="" aria-current="true"><span>全部资料</span><span class="topic-count">${articles.length}</span></a>${topicLinks}</nav><div class="library-links"><a href="/knowledge/archive/">原始总索引 ↗</a><a href="/knowledge/sources/">信息源目录 ↗</a></div></aside><div class="library-main"><form class="search-form" role="search" action="/knowledge/" hidden><label class="sr-only" for="knowledge-search">搜索标题、标签和正文</label><input id="knowledge-search" name="q" type="search" placeholder="搜索标题、标签和正文…" autocomplete="off" aria-describedby="search-help"><button class="search-clear" type="button" hidden>清除</button></form><p id="search-help" class="search-help" hidden>全文搜索，支持中文与英文。多个关键词以空格分隔。</p><div class="list-heading"><h2 id="list-title">全部资料</h2><div class="list-tools"><button id="reset-filters" type="button" hidden>清除筛选</button><span id="result-count" role="status" aria-live="polite">${articles.length} 篇</span></div></div><div id="active-tag" class="active-tag" hidden></div><ul id="article-list" class="article-list">${articles.map(a => entry(a, categories)).join('')}</ul><div class="empty-state" id="empty-state" hidden><h3>没有找到相关资料</h3><p>试试其他关键词，或清除当前筛选。</p><button type="button" id="empty-reset">查看全部资料</button></div><p class="archive-note">内容保留归档时的阅读范围、来源与核验说明，部分资料为摘要或摘录。</p><noscript><p>已展示全部资料。点击主题索引或文章标题即可阅读。</p></noscript></div></section></main>`;
  pages.push({ url: '/knowledge/', html: layout({ title: 'Knowledge Base', description: 'Lest 的个人知识库：AI、Agent 与软件工程的技术资料、阅读笔记和架构调研。', url: '/knowledge/', content, script: true }) });

  await fs.rm(output, { recursive: true, force: true });
  await fs.mkdir(path.join(output, 'assets'), { recursive: true });
  for (const page of pages) {
    const destination = path.join(output, page.url.slice('/knowledge/'.length), 'index.html');
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.writeFile(destination, page.html);
    if (page.doc) {
      const raw = path.join(output, 'raw', page.doc.file);
      await fs.mkdir(path.dirname(raw), { recursive: true });
      await fs.writeFile(raw, page.doc.markdown);
    }
  }
  for (const file of attachments) {
    await fs.mkdir(path.dirname(path.join(output, file)), { recursive: true });
    await fs.copyFile(path.join(source, file), path.join(output, file));
  }
  for (const file of ['knowledge.css', 'library.js']) await fs.copyFile(path.join(here, file), path.join(output, 'assets', file));
  await fs.copyFile(path.join(here, '../../node_modules/highlight.js/styles/github.min.css'), path.join(output, 'assets/highlight-light.css'));
  await fs.copyFile(path.join(here, '../../node_modules/highlight.js/styles/github-dark.min.css'), path.join(output, 'assets/highlight-dark.css'));
  await fs.writeFile(path.join(output, 'search.json'), JSON.stringify({ articles, categories: [...categories.values()] }) + '\n');
  console.log(`Published ${articles.length} articles, ${categories.size} topics, ${documents.size} documents and ${attachments.length} attachments.`);
  return { articles, categories, documents };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (!process.argv[2]) throw new Error('Usage: node scripts/knowledge/build.mjs SOURCE_DIRECTORY [OUTPUT_DIRECTORY]');
  await build(process.argv[2], process.argv[3] || 'knowledge');
}

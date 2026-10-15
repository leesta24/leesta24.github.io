import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export async function verify(directory) {
  const root = path.resolve(directory);
  const siteRoot = path.dirname(root);
  const files = [];
  async function walk(dir) {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      const filename = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(filename);
      else if (entry.isFile()) files.push(filename);
      else throw new Error(`Unexpected file type: ${filename}`);
    }
  }
  await walk(root);
  if (files.some(f => /(?:^|\/)(?:AGENTS\.md|sync\.sh|\.git|\.env)(?:\/|$)/.test(f))) throw new Error('Maintenance file found in published content');
  const data = JSON.parse(await fs.readFile(path.join(root, 'search.json'), 'utf8'));
  if (!data.articles.length || new Set(data.articles.map(a => a.url)).size !== data.articles.length) throw new Error('Empty or duplicate article index');
  const htmlCache = new Map();
  let links = 0;
  for (const filename of files.filter(f => f.endsWith('.html'))) {
    const html = await fs.readFile(filename, 'utf8');
    if ((html.match(/<h1(?:\s|>)/g) || []).length !== 1) throw new Error(`Expected exactly one h1: ${filename}`);
    if (/<script(?![^>]*\bsrc=)[^>]*>/i.test(html)) throw new Error(`Inline script in ${filename}`);
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
    if (new Set(ids).size !== ids.length) throw new Error(`Duplicate HTML ID: ${filename}`);
    const current = new URL('/' + path.relative(siteRoot, filename).split(path.sep).join('/'), 'https://leesta24.github.io');
    for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      const raw = match[1].replaceAll('&amp;', '&');
      const url = new URL(raw, current);
      if (url.origin !== current.origin || !['https:', 'http:'].includes(url.protocol)) continue;
      let target = path.resolve(siteRoot, '.' + decodeURIComponent(url.pathname));
      if (target !== siteRoot && !target.startsWith(siteRoot + path.sep)) throw new Error(`Unsafe site link: ${raw}`);
      let stat;
      try { stat = await fs.stat(target); }
      catch { throw new Error(`Missing local URL in ${path.relative(siteRoot, filename)}: ${raw}`); }
      if (stat.isDirectory()) target = path.join(target, 'index.html');
      await fs.access(target);
      if (url.hash && target.endsWith('.html')) {
        if (!htmlCache.has(target)) htmlCache.set(target, await fs.readFile(target, 'utf8'));
        const id = decodeURIComponent(url.hash.slice(1));
        if (!htmlCache.get(target).includes(`id="${id}"`)) throw new Error(`Missing anchor in ${filename}: ${raw}`);
      }
      links++;
    }
  }
  console.log(`Verified ${data.articles.length} articles, ${files.filter(f => f.endsWith('.html')).length} HTML pages and ${links} internal links.`);
  return { articles: data.articles.length, pages: files.filter(f => f.endsWith('.html')).length, links };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await verify(process.argv[2] || 'knowledge');

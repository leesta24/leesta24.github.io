import { test } from 'node:test';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createServer } from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const run = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Opt in because this checks real pointer/focus handling in an installed browser.
// KNOWLEDGE_BROWSER_EXECUTABLE can target the browser version under investigation.
test('topic bulk actions are idempotent, retain focus and survive repeated pointer input', {
  skip: process.env.KNOWLEDGE_BROWSER_TESTS !== '1', timeout: 120_000,
}, async t => {
  const session = `knowledge-regression-${process.pid}`;
  const browser = (...args) => run('agent-browser', ['--session', session, ...args], { maxBuffer: 1024 * 1024 });
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url, 'http://localhost');
      let file = path.resolve(root, '.' + decodeURIComponent(url.pathname));
      if (!file.startsWith(root + path.sep)) throw new Error('Invalid path');
      if ((await fs.stat(file)).isDirectory()) file = path.join(file, 'index.html');
      const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
      response.setHeader('Content-Type', mime[path.extname(file)] || 'text/plain');
      response.end(await fs.readFile(file));
    } catch { response.writeHead(404).end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => { await browser('close').catch(() => {}); await new Promise(resolve => server.close(resolve)); });
  const launch = process.env.KNOWLEDGE_BROWSER_EXECUTABLE ? ['--executable-path', process.env.KNOWLEDGE_BROWSER_EXECUTABLE] : [];
  await browser(...launch, 'open', `http://127.0.0.1:${server.address().port}/knowledge/`);
  await browser('wait', '--fn', '!document.querySelector("#topic-filter").hidden');
  await browser('eval', `window.expectedArticles = document.querySelectorAll('.entry').length`);
  const expectCount = count => browser('wait', '--fn', `document.querySelector('#result-count').textContent === ${count === 'all' ? "window.expectedArticles + ' 篇'" : "'0 篇'"}`);
  const expectMenu = () => browser('eval', `if (document.querySelector('#topic-menu').hidden || document.querySelector('#topic-trigger').getAttribute('aria-expanded') !== 'true') throw new Error('Bulk action closed the menu')`);
  await browser('click', '#topic-trigger');
  for (let i = 0; i < 3; i++) { await browser('click', '#select-all-topics'); await expectCount('all'); }
  for (let i = 0; i < 20; i++) {
    await browser('click', '#clear-topics');
    await expectCount('none');
    await expectMenu();
    await browser('click', '#select-all-topics');
    await expectCount('all');
    await expectMenu();
  }
  await browser('eval', `if (document.activeElement.id !== 'select-all-topics') throw new Error('Bulk action lost focus')`);
  await browser('eval', `document.querySelector('#clear-topics').click(); document.querySelector('#select-all-topics').click()`);
  await expectCount('all');
  await browser('uncheck', 'input[value="context-memory"]');
  await browser('wait', '--fn', `document.querySelector('#result-count').textContent !== window.expectedArticles + ' 篇'`);
  await browser('click', '#select-all-topics');
  await expectCount('all');
  await browser('press', 'Escape');
  await browser('eval', `if (!document.querySelector('#topic-menu').hidden || document.activeElement.id !== 'topic-trigger') throw new Error('Escape did not close the menu and return focus')`);
  await browser('click', '#topic-trigger');
  await browser('click', '#knowledge-search');
  await browser('wait', '--fn', `document.querySelector('#topic-menu').hidden`);
  await browser('eval', `if (location.search) throw new Error('Select all left a stale category URL')`);
});

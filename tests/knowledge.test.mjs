import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { build } from '../scripts/knowledge/build.mjs';

async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'knowledge-test-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const source = path.join(root, 'source');
  const output = path.join(root, 'knowledge');
  await fs.mkdir(path.join(source, 'materials/topic/assets'), { recursive: true });
  const write = (file, text) => fs.writeFile(path.join(source, file), text);
  await write('INDEX.md', '# Index\n\n| 日期 | 标题 | 来源 | 标签 | 摘要 |\n|---|---|---|---|---|\n| 2026-10-15 | [Article](materials/topic/first.md) | Source | 中文, Agent | Summary |');
  await write('source.md', '# Sources\n\n[Article](materials/topic/first.md)');
  await write('AGENTS.md', 'PRIVATE MAINTENANCE');
  await write('sync.sh', 'PRIVATE SCRIPT');
  await write('materials/topic/README.md', '# Topic\n\nDescription\n\n[First](first.md)');
  await write('materials/topic/first.md', '# Article\n\n[Topic](README.md) [Sources](../../source.md) [Next](next.md#重复-1)\n\n![Asset](assets/图.png)\n\n<script>alert(1)</script>\n\n```js\nconst value = 1;\n```');
  await write('materials/topic/next.md', '# Newly added\n\n- 标签：Future\n\n## 重复\n\nText\n\n## 重复\n\n[Self](#重复-1)\n\n# Embedded source title');
  await write('materials/topic/assets/图.png', 'test-image');
  return { source, output, write };
}

test('publishes all docs, discovers unindexed articles, preserves raw source and rewrites links', async t => {
  const { source, output } = await fixture(t);
  const result = await build(source, output);
  assert.equal(result.articles.length, 2);
  assert.equal(result.documents.size, 5);
  assert.deepEqual(result.articles.find(a => a.title === 'Article').tags, ['中文', 'Agent']);
  const html = await fs.readFile(path.join(output, 'materials/topic/first/index.html'), 'utf8');
  assert.ok(html.includes('href="/knowledge/materials/topic/next/#%E9%87%8D%E5%A4%8D-1"'));
  assert.ok(html.includes('src="/knowledge/materials/topic/assets/%E5%9B%BE.png"'));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(!html.includes('<script>alert'));
  assert.ok(html.includes('hljs-keyword'));
  assert.equal(await fs.readFile(path.join(output, 'raw/materials/topic/first.md'), 'utf8'), await fs.readFile(path.join(source, 'materials/topic/first.md'), 'utf8'));
  const next = await fs.readFile(path.join(output, 'materials/topic/next/index.html'), 'utf8');
  assert.ok(next.includes('id="重复-1"'));
  assert.equal((next.match(/<h1(?:\s|>)/g) || []).length, 1);
  assert.ok(next.includes('<h2 id="embedded-source-title">'));
  await assert.rejects(fs.access(path.join(output, 'AGENTS.md')));
  await assert.rejects(fs.access(path.join(output, 'sync.sh')));
  assert.equal(await fs.readFile(path.join(output, 'materials/topic/assets/图.png'), 'utf8'), 'test-image');
});

test('invalid links abort before replacing a successful output', async t => {
  const { source, output, write } = await fixture(t);
  await build(source, output);
  const before = await fs.readFile(path.join(output, 'index.html'), 'utf8');
  await write('materials/topic/next.md', '# Bad\n[Broken](missing.md)');
  await assert.rejects(build(source, output), /Missing or unpublished local link/);
  assert.equal(await fs.readFile(path.join(output, 'index.html'), 'utf8'), before);
});

test('removes stale generated pages and produces deterministic search data', async t => {
  const { source, output } = await fixture(t);
  await build(source, output);
  const before = await fs.readFile(path.join(output, 'search.json'), 'utf8');
  await fs.writeFile(path.join(output, 'stale.html'), 'stale');
  await build(source, output);
  assert.equal(await fs.readFile(path.join(output, 'search.json'), 'utf8'), before);
  await assert.rejects(fs.access(path.join(output, 'stale.html')));
});

test('refuses source overwrite and traversal links', async t => {
  const { source, output, write } = await fixture(t);
  await assert.rejects(build(source, source), /Output must be/);
  await write('materials/topic/next.md', '# Bad\n[Escape](../../../secret.md)');
  await assert.rejects(build(source, output), /Unsafe content path/);
});

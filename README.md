# Lest's personal site

The static homepage is served by GitHub Pages. `.github/workflows/pages.yml` deploys only `index.html`, `assets/` and generated `knowledge/` from `main`; build scripts and maintenance files are excluded from the deployed artifact. Custom Actions deployment also supports pushes made with the knowledge repository's deploy key.

## Knowledge library

All knowledge documents are intentionally published at https://leesta24.github.io/knowledge/. The source repository `leesta24/knowledge-base` remains private.

```sh
npm ci
npm test
npm run build:knowledge -- /path/to/knowledge-base
npm run verify:knowledge
python3 -m http.server 8765 --bind 127.0.0.1
```

The generator and presentation sources live in `scripts/knowledge/`. The tracked `knowledge/` directory is generated: edit original Markdown in the knowledge repository, or the generator here. A source repository push to `main` touching `materials/**`, `INDEX.md` or `source.md` runs **Publish knowledge library**, which builds and validates all content and pushes only `knowledge/` to this repository. This triggers **Deploy personal site**. The source workflow also supports manual dispatch, useful after changing the generator or design here.

The dedicated write deploy key belongs only to this Pages repository; its private key is stored as the source repository Actions secret `KNOWLEDGE_SITE_DEPLOY_KEY`. It is never part of source code, generated files, browser JavaScript or Git history. The workflow does not collect new articles and does not use a scheduled job. Existing `sync.sh` is unchanged.

Published: `INDEX.md`, `source.md`, all Markdown beneath `materials/`, module indexes, and supported attachments (images, PDF, text, CSV and audio/video). Excluded: maintenance instructions (`AGENTS.md`), scripts, dotfiles, symlinks and unsupported files. A reference to the maintenance instructions links back to the private source repository. Raw Markdown downloads preserve the source documents exactly.

Reading pages are static and usable without JavaScript. JavaScript adds full-text search, a dropdown for selecting multiple topics (including select all / none), tag filters, shareable filter URLs and empty states. Repeated `category` query parameters preserve multiple selections; `category=` means no topics and no category parameter means all topics. Generated interface assets have content-versioned URLs to avoid stale browser caches after a redesign. No runtime GitHub token or API request is needed.

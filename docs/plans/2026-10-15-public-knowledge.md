# Public Knowledge Implementation Plan

**Goal:** Publish all knowledge documents on the existing personal site at /knowledge/ and update them automatically after source changes.

**Architecture:** Build static HTML from the private repository's INDEX.md, source.md and materials/. Keep the private repository private. Store generated pages in the existing public Pages repository. A push-triggered source workflow uses a dedicated repository deploy key to update only generated knowledge files.

**Tech stack:** Node.js, markdown-it, highlight.js, native HTML/CSS/JavaScript, GitHub Actions and the existing GitHub Pages branch deployment.

## Existing design
Geist / Geist Mono, paper #f7f8f5, ink #171918, muted #686d69, thin separators. Preserve homepage sections, copy and anchors. Add Knowledge navigation visible on mobile. Editorial archive layout, restrained motion, responsive article reading, optional system dark mode on knowledge pages.

## Implementation
1. Add a deterministic generator in scripts/knowledge/build.mjs. Discover documents from disk so future unindexed articles also publish. Parse existing index metadata with Markdown tokens. Preserve source bodies, rewrite relative document/attachment links, add heading anchors and syntax highlighting, generate full-text search data and plain Markdown copies. Fail on missing local content links and unsafe paths.
2. Add templates and native CSS/JS for category navigation, article listings, text search, tags, URL-preserved filters, empty state and accessible article TOC. Generate content without browser JavaScript dependency for reading/navigation.
3. Add focused Node tests for cross-document links, heading duplicates, scripts in Markdown, attachments, future documents, exclusions, deleted pages and deterministic builds. Run against the actual archive and verify all local URLs and anchors.
4. Preview desktop, mobile and dark mode using agent-browser; verify search, filters, direct article URLs, navigation and source downloads.
5. Add the private repository's .github/workflows/publish-knowledge.yml (push and manual dispatch, no scheduled collection). Checkout source and website, build and validate, commit only knowledge/, and push with a dedicated homepage deploy key kept in a source repository Actions secret. No change to sync.sh.
6. Commit/push the reviewed website and source workflow after checking remote heads. Use a custom Pages deployment that stages only public site assets, since deploy-key pushes do not trigger legacy branch-based Pages builds. Verify Pages deployment, run the source workflow and verify successful automated publication and live content.

## Publication scope
Include all materials Markdown, module indexes, INDEX.md, source.md and referenced supported attachments. Exclude AGENTS.md, sync.sh, git metadata, credentials and workflow files from content exports. Never rewrite collected document contents for style.

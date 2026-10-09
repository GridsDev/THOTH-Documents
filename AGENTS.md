# AGENTS.md — THOTH V2 Documentation

## Project identity

- **Project:** THOTH V2 Documentation
- **Repository:** [GridsDev/THOTH-Documents](https://github.com/GridsDev/THOTH-Documents)
- **Documented source project:** [Ex0-Adam/THOTH-V2](https://github.com/Ex0-Adam/THOTH-V2)
- **Deployed documentation site:** [thoth-documents.vercel.app](https://thoth-documents.vercel.app/)
- **Purpose:** Thai-language VitePress documentation for the THOTH CMS and its developers.
- **Documentation source:** Markdown files in `guide/`, `reference/`, and `index.md`.
- **Site configuration:** `.vitepress/config.mts`
- **Package manager:** npm; commit and maintain `package-lock.json`.

## Rules for contributors and AI assistants

1. Read this file before changing project files.
2. Write documentation from verifiable source code, current official references, or clearly attributed decisions. Do not present plans or assumptions as implemented behavior.
3. Keep the documentation in Thai unless a page explicitly needs English technical identifiers or examples.
4. Explain technical terms and abbreviations at first use when practical. Prefer clear instructions suitable for developers with basic experience.
5. Keep examples safe to copy: never include real credentials, tokens, private keys, production connection strings, or personal data. Use unmistakable placeholders.
6. Link related pages with valid VitePress routes and update `.vitepress/config.mts` navigation/sidebar when adding or renaming pages.
7. Treat `Ex0-Adam/THOTH-V2` as the source project being documented. Do not change its source from this documentation project; the repositories are separate.
8. Do not create commits, push, alter remotes, or change GitHub repository settings unless the owner explicitly asks.
9. Avoid dependency changes unless needed. Review compatibility and security advisories before changing dependencies, and keep `package-lock.json` in sync with `package.json`.
10. Never deploy production, create paid resources, or expose a development server publicly without explicit authorization.

## Project structure

```text
.
├── .vitepress/config.mts
├── guide/       # Guides, architecture, setup, security, deployment, and status
├── reference/   # API, routes, and glossary
├── index.md     # Documentation home page
├── package.json
├── package-lock.json
└── README.md
```

## Development commands

Run commands from this repository root:

```bash
npm ci
npm run docs:dev
npm run docs:build
npm run docs:preview
npm audit
```

Before reporting documentation changes as complete, run `npm run docs:build`. For dependency changes, also run `npm audit` and inspect the resolved dependency tree.

## Accuracy and security notes

- This repository documents THOTH; it is not the THOTH CMS application.
- Distinguish verified current behavior from roadmap items, proposals, and unresolved decisions.
- Recheck source and platform behavior before updating security, deployment, API, or configuration guidance.
- Avoid copying sensitive values from local environment files, logs, or deployment settings into documentation or chat.
- Documentation dev servers are for local or trusted networks; do not expose them publicly without a deliberate security review.

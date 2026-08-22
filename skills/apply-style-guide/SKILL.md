---
name: apply-style-guide
description: Apply a style guide from the repo, or Google's language guide if none is in the project. Use when the user asks for style-guide fixes or invokes /apply-style-guide.
disable-model-invocation: true
---

# Apply Style Guide

Rewrite the requested files to match **one** style guide. Do not invent a house style.

## Which guide

1. If the user named a guide or path, use that only.
2. Else search the repo for a single project guide, for example:
   - `STYLEGUIDE*`, `STYLE_GUIDE*`, `style-guide*`
   - `docs/style*`, `CONTRIBUTING.md` style sections
   - language-specific files (`*_STYLE.md`, Google copies checked in)
3. If several guides exist, pick the one that matches the files' language. If still ambiguous, stop and ask which file.
4. If none exist, use **Google's** published guide for that language (read it; do not guess):
   - JS/TS — https://google.github.io/styleguide/jsguide.html
   - TypeScript extra — https://google.github.io/styleguide/tsguide.html
   - Python — https://google.github.io/styleguide/pyguide.html
   - Java — https://google.github.io/styleguide/javaguide.html
   - Go — https://google.github.io/styleguide/go/
   - HTML/CSS — https://google.github.io/styleguide/htmlcssguide.html
   - Shell — https://google.github.io/styleguide/shellguide.html
   - Other languages: https://google.github.io/styleguide/ matching page, or stop if there is no Google guide.

State which guide you applied (path or URL) before editing.

## Scope

Paths the user named. If none, files they changed this session. Do not restyle the whole repo unless they asked.

## Apply

- Follow the chosen guide over personal taste.
- Do not change behavior, public APIs, or comments that are not style.
- Do not fight Prettier/Biome/ESLint: after style edits, leave formatting to the project's formatter if one exists.
- Skip generated files.

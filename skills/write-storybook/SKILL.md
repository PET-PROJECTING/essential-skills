---
name: write-storybook
description: Write Storybook stories for the given UI components. Use when the user asks for Storybook stories or invokes /write-storybook.
disable-model-invocation: true
---

# Write Storybook

Add stories for the **components the user names**. Match this repo's Storybook, do not invent a design system.

## Scope

Component files the user named. If none, stop and ask for paths. Do not story the whole tree.

## Detect

Use existing `.stories.*` / `.mdx` as the template: CSF version, `Meta`/`Story` style, autodocs, decorators (router, theme, i18n, QueryClient). Read `.storybook/` only to follow it. Do not upgrade Storybook or add addons unless they asked.

## Write

1. One story file per component, next to the component if that is the convention; otherwise in the folder stories already use.
2. Cover meaningful states: default, empty, loading, error, long content, key variants (size, tone, disabled). Skip states the component cannot reach.
3. Use `args` / controls for knobs the component already exposes. Do not wrap in fake app chrome unless existing stories do.
4. Mock data at the same layer existing stories mock (props vs MSW vs providers).
5. Do not change the component except a story-only export the project already uses.

## After

List story files added. Mention the project's Storybook script if present.

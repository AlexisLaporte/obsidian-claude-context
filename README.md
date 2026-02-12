# Obsidian Claude Context

Obsidian plugin that bridges your vault with [Claude Code](https://docs.anthropic.com/en/docs/claude-code). It exposes the active file, text selection and line number so Claude Code knows what you're looking at.

## How it works

1. The plugin writes a `context.json` file inside its own plugin folder on every file switch or selection change
2. On first load, it auto-installs a [Claude Code skill](https://docs.anthropic.com/en/docs/claude-code/skills) in your vault (`.claude/skills/obsidian/SKILL.md`)
3. When you say "obsidian" or invoke `/obsidian` in Claude Code, the skill reads the context and loads your active file

## context.json

```json
{
  "activeFile": "/absolute/path/to/vault/note.md",
  "vault": "/absolute/path/to/vault",
  "selection": "selected text if any",
  "selectionLine": 42,
  "timestamp": 1770921803931
}
```

Written to `.obsidian/plugins/obsidian-claude-context/context.json`.

## Installation

### Via BRAT (recommended)

1. Install [BRAT](https://github.com/TfTHacker/obsidian42-brat) if you haven't
2. Settings → BRAT → Add Beta Plugin → `AlexisLaporte/obsidian-claude-context`
3. Enable the plugin in Settings → Community Plugins

### Manual

1. Download `main.js` and `manifest.json` from the [latest release](https://github.com/AlexisLaporte/obsidian-claude-context/releases)
2. Create `.obsidian/plugins/obsidian-claude-context/` in your vault
3. Copy both files there
4. Enable the plugin in Settings → Community Plugins

## Usage

1. Open Claude Code from your vault directory
2. Select text in Obsidian (works in both Reading and Editing views)
3. In Claude Code, say "obsidian" or run `/obsidian` — Claude reads your active file and focuses on your selection

A `Claude ●` indicator in the status bar confirms the plugin is running.

## Features

- **Active file tracking** — absolute path updated on every file switch
- **Text selection** — persists when switching to the terminal (cleared on file change)
- **Line number** — 1-based line of the selection start
- **Reading View support** — captures selection via DOM, not just the editor
- **Auto-installed skill** — no manual Claude Code configuration needed
- **Desktop only** — requires Obsidian 1.0+

## Development

```bash
npm install
npm run build    # production build
npm run dev      # development build with sourcemaps
```

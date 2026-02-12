import { Plugin, MarkdownView } from "obsidian";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const CONTEXT_PATH = "/tmp/obsidian-claude-context.json";

const SKILL_CONTENT = `---
description: "Read the currently active file in Obsidian and load it as context. Use when user references their Obsidian vault or says 'obsidian', 'note', 'vault', or wants to work on the file they're looking at."
user_invocable: true
tags: [obsidian, context, notes]
---

# Obsidian — active file context

This skill reads the Obsidian plugin context to know which file is currently open.

## Instructions

1. Read the context file \`/tmp/obsidian-claude-context.json\`

2. If the file doesn't exist or activeFile is null, tell the user the plugin is not active.

3. Parse the JSON and extract activeFile (absolute path), vault, selection, cursor.

4. Read the active file with the Read tool.

5. If a selection is present, highlight it — it's likely what the user wants to discuss.

6. Also read the vault CLAUDE.md at {vault}/CLAUDE.md if it exists.

7. Briefly tell the user which file is loaded, then continue with this context.
`;

export default class ClaudeContextPlugin extends Plugin {
	private statusBarEl: HTMLElement | null = null;
	private lastActiveFile: string | null = null;
	private lastSelection: string | null = null;
	private lastCursor: { line: number; ch: number } | null = null;

	async onload() {
		this.installSkill();
		this.statusBarEl = this.addStatusBarItem();
		this.statusBarEl.setText("Claude ●");

		this.registerEvent(
			this.app.workspace.on("active-leaf-change", () => {
				this.writeContext();
			})
		);

		this.registerEvent(
			this.app.workspace.on("editor-change", () => {
				this.writeContext();
			})
		);

		this.app.workspace.onLayoutReady(() => {
			this.writeContext();
		});
	}

	onunload() {
		try {
			writeFileSync(CONTEXT_PATH, JSON.stringify({ activeFile: null }));
		} catch {}
	}

	private installSkill() {
		try {
			const vaultPath = (this.app.vault.adapter as any).basePath;
			const skillDir = join(vaultPath, ".claude", "skills", "obsidian");
			mkdirSync(skillDir, { recursive: true });
			writeFileSync(join(skillDir, "SKILL.md"), SKILL_CONTENT);
		} catch {}
	}

	private writeContext() {
		const vaultPath = (this.app.vault.adapter as any).basePath;
		const file = this.app.workspace.getActiveFile();

		if (file?.path) {
			this.lastActiveFile = `${vaultPath}/${file.path}`;
			this.lastSelection = null;
			this.lastCursor = null;

			const view = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (view?.editor) {
				const editor = view.editor;
				const selection = editor.getSelection();
				if (selection) {
					this.lastSelection = selection;
				}
				this.lastCursor = editor.getCursor();
			}
		}

		const context = {
			activeFile: this.lastActiveFile,
			vault: vaultPath,
			selection: this.lastSelection,
			cursor: this.lastCursor,
			timestamp: Date.now(),
		};

		try {
			writeFileSync(CONTEXT_PATH, JSON.stringify(context, null, 2));
		} catch {}
	}
}

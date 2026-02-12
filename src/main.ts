import { Plugin, MarkdownView } from "obsidian";
import { EditorView } from "@codemirror/view";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const CONTEXT_FILE = "context.json";
const PLUGIN_ID = "obsidian-claude-context";

const SKILL_CONTENT = `---
description: "Read the currently active file in Obsidian and load it as context. Use when user references their Obsidian vault or says 'obsidian', 'note', 'vault', or wants to work on the file they're looking at."
user_invocable: true
tags: [obsidian, context, notes]
---

# Obsidian — active file context

This skill reads the Obsidian plugin context to know which file is currently open.

## Instructions

1. Read the context file at \`.obsidian/plugins/obsidian-claude-context/context.json\`

2. If the file doesn't exist or activeFile is null, tell the user the plugin is not active.

3. Parse the JSON and extract activeFile (absolute path), vault, selection.

4. Read the active file with the Read tool.

5. If a selection is present, focus on it — it's likely what the user wants to discuss.

6. Also read the vault CLAUDE.md at the vault root if it exists.

7. Briefly tell the user which file is loaded, then continue with this context.
`;

export default class ClaudeContextPlugin extends Plugin {
	private statusBarEl: HTMLElement | null = null;
	private lastActiveFile: string | null = null;
	private lastSelection: string | null = null;

	private get contextPath(): string {
		const vaultPath = (this.app.vault.adapter as any).basePath;
		return join(vaultPath, ".obsidian", "plugins", PLUGIN_ID, CONTEXT_FILE);
	}

	async onload() {
		this.installSkill();
		this.statusBarEl = this.addStatusBarItem();
		this.statusBarEl.setText("Claude ●");

		this.registerEvent(
			this.app.workspace.on("active-leaf-change", () => {
				this.writeContext();
			})
		);

		this.registerEditorExtension(
			EditorView.updateListener.of((update) => {
				if (update.selectionSet) {
					this.writeContext();
				}
			})
		);

		this.app.workspace.onLayoutReady(() => {
			this.writeContext();
		});
	}

	onunload() {
		try {
			writeFileSync(this.contextPath, JSON.stringify({ activeFile: null }));
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
			const filePath = `${vaultPath}/${file.path}`;
			if (filePath !== this.lastActiveFile) {
				this.lastActiveFile = filePath;
				this.lastSelection = null;
			}

			const view = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (view?.editor) {
				const selection = view.editor.getSelection();
				if (selection) {
					this.lastSelection = selection;
				}
			}
		}

		const context = {
			activeFile: this.lastActiveFile,
			vault: vaultPath,
			selection: this.lastSelection,
			timestamp: Date.now(),
		};

		try {
			writeFileSync(this.contextPath, JSON.stringify(context, null, 2));
		} catch {}
	}
}

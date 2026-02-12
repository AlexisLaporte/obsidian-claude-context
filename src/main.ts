import { Plugin, MarkdownView } from "obsidian";
import { writeFileSync } from "fs";

const CONTEXT_PATH = "/tmp/obsidian-claude-context.json";

export default class ClaudeContextPlugin extends Plugin {
	private lastActiveFile: string | null = null;
	private lastSelection: string | null = null;
	private lastCursor: { line: number; ch: number } | null = null;

	async onload() {
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

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => ClaudeContextPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var import_view = require("@codemirror/view");
var import_fs = require("fs");
var import_path = require("path");
var CONTEXT_FILE = "context.json";
var PLUGIN_ID = "obsidian-claude-context";
var SKILL_CONTENT = `---
description: "Read the currently active file in Obsidian and load it as context. Use when user references their Obsidian vault or says 'obsidian', 'note', 'vault', or wants to work on the file they're looking at."
user_invocable: true
tags: [obsidian, context, notes]
---

# Obsidian \u2014 active file context

This skill reads the Obsidian plugin context to know which file is currently open.

## Instructions

1. Read the context file at \`.obsidian/plugins/obsidian-claude-context/context.json\`

2. If the file doesn't exist or activeFile is null, tell the user the plugin is not active.

3. Parse the JSON and extract activeFile (absolute path), vault, selection, cursor.

4. Read the active file with the Read tool.

5. If a selection is present, highlight it \u2014 it's likely what the user wants to discuss.

6. Also read the vault CLAUDE.md at the vault root if it exists.

7. Briefly tell the user which file is loaded, then continue with this context.
`;
var ClaudeContextPlugin = class extends import_obsidian.Plugin {
  constructor() {
    super(...arguments);
    this.statusBarEl = null;
    this.lastActiveFile = null;
    this.lastSelection = null;
    this.lastCursor = null;
  }
  get contextPath() {
    const vaultPath = this.app.vault.adapter.basePath;
    return (0, import_path.join)(vaultPath, ".obsidian", "plugins", PLUGIN_ID, CONTEXT_FILE);
  }
  async onload() {
    this.installSkill();
    this.statusBarEl = this.addStatusBarItem();
    this.statusBarEl.setText("Claude \u25CF");
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", () => {
        this.writeContext();
      })
    );
    this.registerEditorExtension(
      import_view.EditorView.updateListener.of((update) => {
        if (update.selectionSet || update.docChanged) {
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
      (0, import_fs.writeFileSync)(this.contextPath, JSON.stringify({ activeFile: null }));
    } catch (e) {
    }
  }
  installSkill() {
    try {
      const vaultPath = this.app.vault.adapter.basePath;
      const skillDir = (0, import_path.join)(vaultPath, ".claude", "skills", "obsidian");
      (0, import_fs.mkdirSync)(skillDir, { recursive: true });
      (0, import_fs.writeFileSync)((0, import_path.join)(skillDir, "SKILL.md"), SKILL_CONTENT);
    } catch (e) {
    }
  }
  writeContext() {
    const vaultPath = this.app.vault.adapter.basePath;
    const file = this.app.workspace.getActiveFile();
    if (file == null ? void 0 : file.path) {
      this.lastActiveFile = `${vaultPath}/${file.path}`;
      this.lastSelection = null;
      this.lastCursor = null;
      const view = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
      if (view == null ? void 0 : view.editor) {
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
      timestamp: Date.now()
    };
    try {
      (0, import_fs.writeFileSync)(this.contextPath, JSON.stringify(context, null, 2));
    } catch (e) {
    }
  }
};

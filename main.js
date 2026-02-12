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
var import_fs = require("fs");
var CONTEXT_PATH = "/tmp/obsidian-claude-context.json";
var ClaudeContextPlugin = class extends import_obsidian.Plugin {
  constructor() {
    super(...arguments);
    this.lastActiveFile = null;
    this.lastSelection = null;
    this.lastCursor = null;
  }
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
      (0, import_fs.writeFileSync)(CONTEXT_PATH, JSON.stringify({ activeFile: null }));
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
      (0, import_fs.writeFileSync)(CONTEXT_PATH, JSON.stringify(context, null, 2));
    } catch (e) {
    }
  }
};

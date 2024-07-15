import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export class NodeDependenciesProvider implements vscode.TreeDataProvider<Regions> {
  private treeView!: vscode.TreeView<Regions>;

  constructor(private workspaceRoot: string, private editorText: string) {
    this.initializeTreeView();
  }

  initializeTreeView(): void {
    this.treeView = vscode.window.createTreeView("better-regions.test", { treeDataProvider: this });
    this.treeView.onDidChangeSelection(this.handleTreeItemClicked.bind(this));
  }

  handleTreeItemClicked(event: vscode.TreeViewSelectionChangeEvent<Regions>): void {
    if (event.selection.length > 0) {
      const clickedElement = event.selection[0];

      let editor = vscode.window.activeTextEditor;
      if (editor) {
        let range = editor.document.lineAt(clickedElement.lineNumber - 1).range;
        editor.selection = new vscode.Selection(range.start, range.end);
        editor.revealRange(range);
      }
      // Handle the clicked element here
    }
  }

  getTreeItem(element: Regions): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(element?: Regions | undefined): vscode.ProviderResult<Regions[]> {
    if (!element && this.workspaceRoot) {
      return Promise.resolve(this.getSubregionsInRegion(path.join(this.workspaceRoot, "src/panel/main.ts"), ""));
    }

    if (!element) {
      return Promise.resolve(this.getSubregionsInRegion("", this.editorText));
    }

    if (!element.contextValue) {
      return Promise.resolve([]);
    }

    return Promise.resolve(JSON.parse(element.contextValue));
  }

  private getSubregionsInRegion(file: string, fileString: string): Regions[] {
    if (file) {
      fileString = fs.readFileSync(file, "utf-8");
      if (!fileString) return [];
    }

    const regions = [];

    fileString = fileString.replaceAll("\r\n", "\n");

    let lineNumber = 0;

    let isFirstIteration = true;
    for (const region of fileString.split("#region ")) {
      if (isFirstIteration) {
        lineNumber += region.split("\n").length;
        isFirstIteration = false;
        continue;
      }

      const children = [];

      let isFirstIterationInRegion = true;
      let subRegionLineNumber = 0;
      for (const subRegion of region.split("#subregion ")) {
        if (isFirstIterationInRegion) {
          subRegionLineNumber += subRegion.split("\n").length - 1;
          isFirstIterationInRegion = false;
          continue;
        }

        children.push(new Regions(subRegion.split("\n")[0], lineNumber + subRegionLineNumber, vscode.TreeItemCollapsibleState.None, ""));
        subRegionLineNumber += subRegion.split("\n").length - 1;
      }

      const state = children.length > 0 ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None;
      regions.push(new Regions(region.split("\n")[0], lineNumber, state, JSON.stringify(children)));
      lineNumber += region.split("\n").length - 1;
    }

    return regions;
  }
}

class Regions extends vscode.TreeItem {
  constructor(public readonly label: string, public lineNumber: number, public readonly collapsibleState: vscode.TreeItemCollapsibleState, private readonly children: string) {
    super(label, collapsibleState);
    this.tooltip = `${lineNumber}`;
    this.description = `Line number: ${lineNumber}`;
    this.contextValue = children;
  }
}

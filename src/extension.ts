import * as vscode from "vscode";
import { NodeDependenciesProvider } from "./treeview";

export function activate(context: vscode.ExtensionContext) {
  /* const disposable = vscode.commands.registerCommand("better-regions.helloWorld", () => {
    vscode.window.showInformationMessage("Hello World from better regions!");
  });
  context.subscriptions.push(disposable); */

  let editor = vscode.window.activeTextEditor;
  if (editor) {
    let range = editor.document.lineAt(20 - 1).range;
    editor.selection = new vscode.Selection(range.start, range.end);
    editor.revealRange(range);

    const documentText = editor.document.getText();
    new NodeDependenciesProvider("", documentText);
  }
  /*   const rootPath = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0 ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;
  if (rootPath) vscode.window.registerTreeDataProvider("better-regions.test", new NodeDependenciesProvider(rootPath)); */
  vscode.window.onDidChangeActiveTextEditor((editor) => {
    if (editor) {
      const documentText = editor.document.getText();
      new NodeDependenciesProvider("", documentText);
    }
  });
}

export function deactivate() {}

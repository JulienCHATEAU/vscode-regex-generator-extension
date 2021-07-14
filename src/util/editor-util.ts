import * as vscode from 'vscode';

export const getSelectedText = (): string => {
  const editor = vscode.window.activeTextEditor
  if (!editor) {
    return ""; // No open text editor
  }
  const text = editor.document.getText(editor.selection)
  return text
}
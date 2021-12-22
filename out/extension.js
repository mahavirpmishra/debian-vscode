"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "debian-vscode" is now active!');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('helloworld.helloWorld', () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World!');
    });
    context.subscriptions.push(disposable);
    disposable = vscode.languages.registerDocumentSymbolProvider({ scheme: "file", language: "debian-control" }, new DebianConfigDocumentSymbolProvider());
    context.subscriptions.push(disposable);
}
exports.activate = activate;
class DebianConfigDocumentSymbolProvider {
    provideDocumentSymbols(document, token) {
        return new Promise((resolve, reject) => {
            let symbols = [];
            let children = [];
            let symbolStart = null;
            let symbol = null;
            for (var i = 0; i < document.lineCount; i++) {
                const line = document.lineAt(i);
                const field = line.text.match(/^([A-Z][a-zA-Z-]+): *(\S+)?/);
                if (field) {
                    if (!symbolStart) {
                        symbolStart = line.range;
                    }
                    const fieldName = field[1];
                    const child = new vscode.DocumentSymbol(fieldName, line.text.substring(fieldName.length + 1).trim(), vscode.SymbolKind.Field, new vscode.Range(line.range.start, line.range.end), new vscode.Range(line.range.start, line.range.end));
                    children.push(child);
                    const packageName = field[2];
                    if ((fieldName === "Package" || fieldName === "Source") && packageName) {
                        symbol = new vscode.DocumentSymbol(packageName, fieldName, vscode.SymbolKind.Package, new vscode.Range(symbolStart.start, symbolStart.end), new vscode.Range(symbolStart.start, symbolStart.end));
                    }
                }
                if (line.isEmptyOrWhitespace || i === document.lineCount - 1) {
                    if (symbol) {
                        symbol.children = children;
                        symbols.push(symbol);
                        symbol = null;
                    }
                    children = [];
                    symbolStart = null;
                }
            }
            resolve(symbols);
        });
    }
}
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map
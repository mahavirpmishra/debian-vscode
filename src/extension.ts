// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
   // Use the console to output diagnostic information (console.log) and errors (console.error)
   // This line of code will only be executed once when your extension is activated
   console.log('Congratulations, your extension "debian-vscode" is now active!');

   let disposable = vscode.languages.registerDocumentSymbolProvider({ scheme: "file", language: "debian-control" }, new DebianConfigDocumentSymbolProvider());
   context.subscriptions.push(disposable);

}

class DebianConfigDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
   provideDocumentSymbols(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.SymbolInformation[] | vscode.DocumentSymbol[]> {
      return new Promise((resolve, reject) => {
         let symbols: vscode.DocumentSymbol[] = [];
         let children: vscode.DocumentSymbol[] = [];
         let symbolStart: vscode.Range = null;
         let symbol: vscode.DocumentSymbol = null;

         for (var i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);
            const field = line.text.match(/^([A-Z][a-zA-Z-]+): *(\S+)?/)
            if (field) {
               if (!symbolStart) {
                  symbolStart = line.range;
               }
               const fieldName = field[1]
               const child = new vscode.DocumentSymbol(fieldName, line.text.substring(fieldName.length + 1).trim(),
                  vscode.SymbolKind.Field,
                  new vscode.Range(line.range.start, line.range.end),
                  new vscode.Range(line.range.start, line.range.end));
               children.push(child);

               const packageName = field[2]
               if ((fieldName === "Package" || fieldName === "Source") && packageName) {
                  symbol = new vscode.DocumentSymbol(
                     packageName, fieldName,
                     vscode.SymbolKind.Package,
                     new vscode.Range(symbolStart.start, symbolStart.end),
                     new vscode.Range(symbolStart.start, symbolStart.end));
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
export function deactivate() { }

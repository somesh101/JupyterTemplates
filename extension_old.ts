import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "jupyter-notebook-template" is now active!');

    let disposable = vscode.commands.registerCommand('extension.createNewJupyterNotebook', async () => {
        const templatePath = path.join(vscode.workspace.rootPath || '', 'path/to/your/template.ipynb');
        const notebooksDir = path.join(vscode.workspace.rootPath || '', 'notebooks');
        if (!fs.existsSync(notebooksDir)) {
            fs.mkdirSync(notebooksDir);
        }

        const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
        const newNotebookPath = path.join(notebooksDir, `notebook_${timestamp}.ipynb`);
        fs.copyFileSync(templatePath, newNotebookPath);

        vscode.window.showInformationMessage(`New notebook created: ${newNotebookPath}`);

        const document = await vscode.workspace.openTextDocument(newNotebookPath);
        vscode.window.showTextDocument(document);
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}

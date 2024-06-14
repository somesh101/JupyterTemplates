const vscode = require("vscode");
const path = require("path");
const fs = require("fs");

function readFile(filePath) {
  try {
    const content = JSON.parse(fs.readFileSync(filePath, "utf8"));

    if (Array.isArray(content)) {
      const notebookCells = content.map(
        (value) =>
          new vscode.NotebookCellData(
            vscode.NotebookCellKind.Code,
            value.text,
            "python"
          )
      );
      return notebookCells;
    }
  } catch (err) {
    return new vscode.NotebookCellData(
      vscode.NotebookCellKind.Code,
      "",
      "python"
    );
  }
}
function activate(context) {
  // Register command
  let disposable = vscode.commands.registerCommand(
    "jupyter-templates.createNotebookFromTemplate",
    async () => {
      // Path to the .ipynb file
      const fileUri =
        "K:\\VS-Extension-dev\\jupyter-templates\\jupyter-templates\\jupyter-templates\\template.json";

      const notebookPath = path.join(fileUri);

      let notebookContent = readFile(notebookPath);

      // Open the .ipynb file as a notebook
      // not using untitle lable causes it to open directly into template file.
      try {
        const notebookUri = vscode.Uri.parse("untitled:template.ipynb");
        const edit = new vscode.WorkspaceEdit();

        const document = await vscode.workspace.openNotebookDocument(
          notebookUri
        );

        // console.log(notebookContent);

        let range = new vscode.NotebookRange(0, 3);
        let ed = new vscode.NotebookEdit(range, notebookContent);

        // setting changes and applying them to file before document is displayed
        edit.set(document.uri, [ed]);
        await vscode.workspace.applyEdit(edit);

        await vscode.window.showNotebookDocument(document, {
          viewColumn: vscode.ViewColumn.One,
        });

        //opening the connection to current doc and trying to apply those changes in live

        //        edit.set(editor.notebook.uri, [ed]);
        await vscode.workspace.applyEdit(edit);

        //document.isDirty = true;
      } catch (error) {
        vscode.window.showErrorMessage(
          `Failed to open notebook: ${error.message}`
        );
      }
    }
  );

  context.subscriptions.push(disposable);
}

exports.activate = activate;

function deactivate() {}

exports.deactivate = deactivate;

const vscode = require("vscode");
const path = require("path");
const fs = require("fs");

/**
 * Presents template names as menu for user to choose.
 * @param {context.extensionPath} templateFilePath - extension directory from where extension was launched.
 * This function handles the logic for reading the template and creating a an array of cells with thier properties
 * 
 */
function readTemplate(templateFilePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(templateFilePath, "utf8", (err, templateData) => {
      if (err) {
        console.error(`Error reading template ${templateFilePath}:`, err);
        reject(err);
        return;
      }

      try {
        const templateJson = JSON.parse(templateData);

        // Extract cells from template JSON and convert to vscode.NotebookCellData array
        const vscodeCells = templateJson.cells.map((cell) => {
          let cellKind;
          switch (cell.cell_type) {
            case "code":
              cellKind = vscode.NotebookCellKind.Code;
              break;
            case "markdown":
              cellKind = vscode.NotebookCellKind.Markup;
              break;
            case "raw":
              cellKind = vscode.NotebookCellKind.Markup;
              break;
            default:
              cellKind = vscode.NotebookCellKind.Code;
          }

          const vscodeCell = new vscode.NotebookCellData(
            cellKind,
            cell.source, // Join source array into a single string
            cell.language || "python" // Replace with actual language if available
          );

          // Set metadata if available
          if (cell.metadata) {
            vscodeCell.metadata = cell.metadata;
          } else {
            vscodeCell.metadata = {};
          }

          return vscodeCell;
        });

        resolve(vscodeCells);
      } catch (error) {
        console.error(
          `Error parsing template JSON from ${templateFilePath}:`,
          error
        );
        reject(error);
      }
    });
  });
}

/**
 * Presents template names as menu for user to choose.
 * @param {vscode.ExtensionContext} context - The context in which the extension is activated.
 * 
 */

async function loadTemplate(context, templateName) {
  try {
    const templateFilePath = path.join(
      context.extensionPath,
      `/templates/${templateName}`
    );
    const uri = vscode.Uri.parse(`untitled:${templateFilePath}`);
    const document = await vscode.workspace.openNotebookDocument(uri);
    const edit = new vscode.WorkspaceEdit();

    const vscodeCells = await readTemplate(templateFilePath);

    let range = new vscode.NotebookRange(0, vscodeCells.length);
    let notebookChanges = new vscode.NotebookEdit(range, vscodeCells);
    edit.set(document.uri, [notebookChanges]);
    await vscode.workspace.applyEdit(edit);

    await vscode.window.showNotebookDocument(document, {
      viewColumn: vscode.ViewColumn.One,
    });
    vscode.window.showInformationMessage(
      `Template ${templateName} loaded successfully`
    );
  } catch (error) {
    console.error(`Error loading template ${templateName}:`, error);
    vscode.window.showErrorMessage(`Error loading template ${templateName}`);
  }
}

/**
 * Creates a new JupyterLab template.
 * @param {vscode.ExtensionContext} context - The context in which the extension is activated.
 * This function handles the logic for creating a new template and saving it to the appropriate directory.
 */

async function createTemplate(context) {
  const editor = vscode.window.activeNotebookEditor;

  if (!editor) {
    vscode.window.showErrorMessage("No active editor found");
    return;
  }

  const document = editor.notebook;
//   console.log('flag');
//   let cells = document.getCells();
//   for (let i = 0; i < cells.length; i++) {
//     console.log(cells[i].document.getText());
// }  
  const filePath = document.uri.fsPath;

  if (!filePath.endsWith(".ipynb")) {
    vscode.window.showErrorMessage(
      "The active file is not a Jupyter Notebook (.ipynb)"
    );
    return;
  }

  try {
    const notebookContent = document.getCells();

    const cells = notebookContent.map((cell, index) => ({
      cell_type: cell.kind,
      source :  cell.document.getText(),
      metadata: cell.metadata,
      position: cell.index,
    }));

    const templateContent = {
      cells,
      metadata: notebookContent.metadata,
    };

    let templateName = await createTemplateCommand();

    const templateFilePath = path.join(
      context.extensionPath,
      `templates/${templateName}.ipynb`
    );
    fs.writeFile(
      templateFilePath,
      JSON.stringify(templateContent, null, 2),
      "utf8",
      (err) => {
        if (err) {
          console.error("Error creating template:", err);
          vscode.window.showErrorMessage("Error creating template");
          return;
        }
        vscode.window.showInformationMessage("Template created successfully");
      }
    );
  } catch (err) {
    console.error("Error creating template:", err);
    vscode.window.showErrorMessage("Error creating template");
  }
}


/**
 * Reads template fileName from the templates directory.
 * @param {vscode.ExtensionContext} context - The context in which the extension is activated.
 * This function handles the logic for reading the template fileNames.
 */
function getTemplates(context) {
  const templatesDir = path.join(context.extensionPath, "/templates/");
  const templateFiles = fs.readdirSync(templatesDir);
  return templateFiles.map((file) => ({
    label: path.basename(file, ".ipynb"),
    description: file,
  }));
}

/**
 * Presents template names as menu for user to choose.
 * @param {vscode.ExtensionContext} context - The context in which the extension is activated.
 * 
 */
async function loadTemplateCommand(context) {
  const templates = getTemplates(context);
  if (templates.length === 0) {
    vscode.window.showInformationMessage("No templates available.");
    return;
  }

  const selectedTemplate = await vscode.window.showQuickPick(templates, {
    placeHolder: "Select a template to load",
  });

  if (!selectedTemplate) {
    return; // User cancelled the selection
  }

  loadTemplate(context, selectedTemplate.description);
}

/**
 * Reads User inut for new template fileName.
 * 
 */
async function createTemplateCommand() {
  const templateName = await vscode.window.showInputBox({
    placeHolder: "Enter template name",
  });

  if (!templateName) {
    return; // User cancelled the input
  }
  return templateName;
}

/**
 * This method is called when your extension is activated.
 * @param {vscode.ExtensionContext} context - The context in which the extension is activated.
 */
function activate(context) {
  let disposableLoadTemplate = vscode.commands.registerCommand(
    "jupyter-templates.loadTemplate",
    async () => {
      await loadTemplateCommand(context);
    }
  );

  let disposableCreateTemplate = vscode.commands.registerCommand(
    "jupyter-templates.createTemplate",
    async () => {
      await createTemplate(context);
    }
  );

  context.subscriptions.push(disposableLoadTemplate);

  context.subscriptions.push(disposableCreateTemplate);
}

exports.activate = activate;

function deactivate() {}

exports.deactivate = deactivate;

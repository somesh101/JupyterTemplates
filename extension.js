const vscode = require("vscode");
const path = require("path");
const fs = require("fs");

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
            cell.source.join(""), // Join source array into a single string
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

async function createTemplate(context) {
  const editor = vscode.window.activeNotebookEditor;
 
  if (!editor) {
    vscode.window.showErrorMessage("No active editor found");
    return;
  }

  const document = editor.notebook;
  const filePath = document.uri.fsPath;

  if (!filePath.endsWith(".ipynb")) {
    vscode.window.showErrorMessage(
      "The active file is not a Jupyter Notebook (.ipynb)"
    );
    return;
  }

  try {
    const notebookContent = JSON.parse(fs.readFileSync(filePath, "utf8"));

    const cells = notebookContent.cells.map((cell, index) => ({
      cell_type: cell.cell_type,
      source: cell.source,
      metadata: cell.metadata,
      position: index,
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

function getTemplates(context) {
  const templatesDir = path.join(context.extensionPath, "/templates/");
  const templateFiles = fs.readdirSync(templatesDir);
  return templateFiles.map((file) => ({
    label: path.basename(file, ".ipynb"),
    description: file,
  }));
}

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

async function createTemplateCommand() {
  const templateName = await vscode.window.showInputBox({
    placeHolder: "Enter template name",
  });

  if (!templateName) {
    return; // User cancelled the input
  }
  return templateName;
}


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

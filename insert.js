const vscode = require("vscode");
const path = require("path");
const fs = require("fs");

/**
 * Presents template names as menu for user to choose.
 * This function handles the logic for reading the template file names and delete the selected file.
 */
async function openNotebookEditor() {
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
  return editor;
}

/**
 * Postion = 0 means new notebook and 1 means get the actual postion from opennotebook
 * 
 */
async function insertTemplateCells(notebookdata, Position) {
  // Load the template to get the template name
  const editor = openNotebookEditor();
  // editor.
  const uri = (await editor).notebook.uri; //vscode.Uri.parse(`untitled:template.ipynb`);
  const document = await vscode.workspace.openNotebookDocument(uri);
  const edit = new vscode.WorkspaceEdit();

  const vscodeCells = notebookdata;
  // console.log(vscodeCells);
  if (Position > 0) Position = (await editor).selection.start;

  let range = new vscode.NotebookRange(
    Position + 1,
    Position + vscodeCells.length
  );
  let notebookChanges = new vscode.NotebookEdit(range, vscodeCells);
  edit.set(document.uri, [notebookChanges]);
  await vscode.workspace.applyEdit(edit);

  await vscode.window.showNotebookDocument(document, {
    viewColumn: vscode.ViewColumn.One,
  });
}

async function getTemplates(templateDir, type) {
  if (!fs.existsSync(templateDir)) {
    vscode.window.showErrorMessage("Templates folder does not exist.");
    return;
  }

  const templateFiles = fs.readdirSync(templateDir);
  return templateFiles.map((file) => ({
    label: path.basename(file, type),
    description: file,
  }));
}

async function quickPickCommand(templates) {
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
  // @ts-ignore
  return selectedTemplate.description;
}
/**
 * Presents template names as menu for user to choose.
 * @param {templateFilePath} templateFilePath - extension directory from where extension was launched.
 * This function handles the logic for reading the template and creating a an array of cells with thier properties
 *
 */
// @ts-ignore
async function readTemplate(templateFilePath) {
  try {
    // Read the file synchronously
    const templateData = fs.readFileSync(templateFilePath, "utf8");

    const templateJson = JSON.parse(templateData);

    // Ensure templateJson.cells is an array
    if (!Array.isArray(templateJson.cells)) {
      throw new TypeError("Expected templateJson.cells to be an array");
    }

    // Extract cells from template JSON and convert to vscode.NotebookCellData array
    const vscodeCells = templateJson.cells.map((cell) => {
      let cellKind;
      switch (cell.cell_type) {
        case "code":
        case "2":
        case 2:
          cellKind = vscode.NotebookCellKind.Code;
          break;
        case "markdown":
        case "1":
        case 1:
          cellKind = vscode.NotebookCellKind.Markup;
          break;
        case "raw":
          cellKind = vscode.NotebookCellKind.Markup;
          break;
        default:
          cellKind = vscode.NotebookCellKind.Code;
      }

      // Ensure cell.source is handled correctly
      if (Array.isArray(cell.source)) {
        cell.source = cell.source.join("\n");
      } else {
        cell.source = String(cell.source);
      }


      const vscodeCell = new vscode.NotebookCellData(
        cellKind,
        cell.source || "", // Join source array into a single string
        cell.language || "python" // Replace with actual language if available
      );

      // Set metadata if available
      if (cell.metadata) {
        vscodeCell.metadata = cell.metadata.metadata;
      } else {
        vscodeCell.metadata = {};
      }

      return vscodeCell;
    });

    let notebook = new vscode.NotebookData(vscodeCells);
    notebook.metadata = templateJson.metadata;
    console.log("Returning notebook data:", notebook);


    return notebook;
  } catch (error) {
    console.error(`Error processing template ${templateFilePath}:`, error);
    throw error;
  }
}

async function loadTemplateasEdits(context) {
  //function to open notebook
  console.log("calling as edits");
  let timestamp = new Date().getTime();
  vscode.Uri.parse(`untitled:template-${timestamp}.ipynb`);
  
  let emptyNotebook = new vscode.NotebookData([]);
  emptyNotebook.metadata = {}; 
  try {
    // loading empty document
    const notebookDocument = await vscode.workspace.openNotebookDocument('jupyter-notebook', emptyNotebook);
    
    // Show the notebook document to bring it into focus
    await vscode.window.showNotebookDocument(notebookDocument);
} catch (error) {
    console.error('Failed to open and focus the notebook document:', error);
}
  InsertInOpenNotebook(context, 0)
}

async function loadTemplate(context) {
  //function to open notebook
  let timestamp = new Date().getTime();
  vscode.Uri.parse(`untitled:template-${timestamp}.ipynb`);

  const templateDir = context.extensionPath + "/templates/";

  const templatesList = await getTemplates(templateDir, ".ipynb");
  const templateName = await quickPickCommand(templatesList);
  const templatePath = templateDir + templateName;
  let notebookdata = await readTemplate(templatePath);
  // console.log("template : ", notebookdata);
  try {
    // Open the notebook document
    const notebookDocument = await vscode.workspace.openNotebookDocument('jupyter-notebook', notebookdata);
    
    // Show the notebook document to bring it into focus
    await vscode.window.showNotebookDocument(notebookDocument);
} catch (error) {
    console.error('Failed to open and focus the notebook document:', error);
}
}

/*
 * Postion = 0 means new notebook and 1 means get the actual postion from opennotebook
*
*/
async function InsertInOpenNotebook(context, position = 1) {
  const templateDir = context.extensionPath + "/templates/";

  const templatesList = await getTemplates(templateDir, ".ipynb");
  const templateName = await quickPickCommand(templatesList);
  const templatePath = templateDir + templateName;

  let notebookdata = await readTemplate(templatePath);
  // console.log("template : ", notebookdata);
  insertTemplateCells(notebookdata.cells, position);
  //   readTemplate(templatePath).then( notebookdata => {
  //     insertTemplateCells(notebookdata.cells, position);
  //   }).then(undefined, err => {
  //     console.error('I am error');
  //  });
}

module.exports = {
  openNotebookEditor,
  insertTemplateCells,
  getTemplates,
  quickPickCommand,
  readTemplate,
  loadTemplate,
  InsertInOpenNotebook,
  loadTemplateasEdits
};

const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const insert = require("./insert.js");
/**
 * Creates a new JupyterLab template.
 * @param {vscode.ExtensionContext} context - The context in which the extension is activated.
 * This function handles the logic for creating a new template and saving it to the appropriate directory.
 */
async function createTemplate(context) {
  const document = (await insert.openNotebookEditor()).notebook;
  try {
    const notebookContent = document.getCells();

    const cells = notebookContent.map((cell, index) => {
      const cell_type =  cell.kind === 1 ? 'markdown' : cell.kind === 2 ? 'code' : 'markdown';
      // Get all lines from the document
    const lines = [];
    for (let i = 0; i < cell.document.lineCount; i++) {
      lines.push(cell.document.lineAt(i).text);
    }

    return {
      cell_type: cell_type,
      source: lines,
      metadata: cell.metadata, // Ensure this is already a dictionary
      position: index, // Use index directly
    };
  });
    
    const templateContent = {
      cells,
      metadata: document.metadata.metadata,
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

module.exports = { createTemplate, createTemplateCommand };

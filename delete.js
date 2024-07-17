const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const { getTemplates, quickPickCommand } = require("./insert.js");

/**
 * Presents template names as menu for user to choose.
 * @param {context} context - extension directory from where extension was launched.
 * This function handles the logic for reading the template file names and delete the selected file.
 *
 */
async function listAndDeleteTemplates(context) {
  // @ts-ignore
  const templatesPath = path.join(context.extensionPath, "/templates/");

  while (true) {
    // Read the templates folder
    let templates = getTemplates(templatesPath, ".ipynb");

    // Present the list of templates to the user
    const templateToDelete = await quickPickCommand(templates);

    // If the user hits escape, exit the loop
    if (!templateToDelete) {
      break;
    }

    // Delete the selected template
    const templatePath = path.join(templatesPath, templateToDelete);
    try {
      fs.unlinkSync(templatePath);
      vscode.window.showInformationMessage(
        `Template ${templateToDelete} deleted.`
      );
    } catch (err) {
      vscode.window.showErrorMessage(
        `Failed to delete template ${templateToDelete}.`
      );
    }
  }
  return;
}

module.exports =  { listAndDeleteTemplates };

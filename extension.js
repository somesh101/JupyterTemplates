const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const del = require("./delete.js");
const insert = require("./insert.js");
const create = require('./create.js');

/**
 * This method is called when your extension is activated.
 * @param {vscode.ExtensionContext} context - The context in which the extension is activated.
 */
function activate(context) {
  
  let disposableLoadTemplate = vscode.commands.registerCommand(
    "jupyter-templates.loadTemplate",
    async () => {
      await insert.loadTemplateUsingEdit(context);
    }
  );

  let disposableCreateTemplate = vscode.commands.registerCommand(
    "jupyter-templates.createTemplate",
    async () => {
      await create.createTemplate(context);
    }
  );

  let disposabledeleteTemplate = vscode.commands.registerCommand(
    'jupyter-templates.listAndDeleteTemplates', 
    async () => {
    // @ts-ignore
    await del.listAndDeleteTemplates(context);
    }
  );

  let disposableinsertTemplateCells = vscode.commands.registerCommand(
    'jupyter-templates.InsertInOpenNotebook', 
    async () => {
    await insert.InsertInOpenNotebook(context);
    }
  );
  context.subscriptions.push(disposableCreateTemplate);
  context.subscriptions.push(disposableLoadTemplate);
  context.subscriptions.push(disposableinsertTemplateCells);
  context.subscriptions.push(disposabledeleteTemplate);
}

exports.activate = activate;

function deactivate() {}

exports.deactivate = deactivate;

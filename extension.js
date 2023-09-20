// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

function fixJsonString(jsonStr) {	
    // Fix Python booleans and None
	let fixedStr = jsonStr.replace(/True/g, 'true')
	.replace(/False/g, 'false') // Replace Python booleans with JSON booleans
	.replace(/None/g, 'null') // Replace Python None with JSON null
	.replace(/(\w+)\s*:/g, '"$1":')  // Add missing quotation marks around keys
	.replace(/'/g, '"')  // Replace single quotes with double quotes
	.replace(/,\s*([}\]])/g, '$1')  // Remove trailing commas
	.replace(/\/\/[^\n]*/g, '')  // Remove single-line comments
	.replace(/\/\*[\s\S]*?\*\//g, '');  // Remove multi-line comments

    return fixedStr;
}


function formatJson(jsonStr) {
	vscode.window.showInformationMessage(jsonStr);
	
	let fixedJson = fixJsonString(jsonStr);
    vscode.window.showInformationMessage(fixedJson);
	
    return new Promise((resolve, reject) => {
		fetch("https://jsonformatter.curiousconcept.com/process", {
			"headers": {
				"accept": "application/json, text/javascript, */*; q=0.01",
				"accept-language": "en-US,en;q=0.9,fr;q=0.8,ar;q=0.7",
				"content-type": "application/x-www-form-urlencoded; charset=UTF-8",
				"sec-ch-ua": "\"Google Chrome\";v=\"117\", \"Not;A=Brand\";v=\"8\", \"Chromium\";v=\"117\"",
				"sec-ch-ua-mobile": "?0",
				"sec-ch-ua-platform": "\"Linux\"",
				"sec-fetch-dest": "empty",
				"sec-fetch-mode": "cors",
				"sec-fetch-site": "same-origin",
				"sec-gpc": "1",
				"x-requested-with": "XMLHttpRequest"
			},
			"referrer": "https://jsonformatter.curiousconcept.com/",
			"referrerPolicy": "strict-origin-when-cross-origin",
			"body": `data=${encodeURIComponent(fixedJson)}&jsontemplate=1&jsonspec=4&jsonfix=on&autoprocess=&version=2`,
			"method": "POST",
			"mode": "cors",
			"credentials": "include"
		}).then(response => response.json())
		.then(jsonResponse => {
			if (jsonResponse.result && jsonResponse.result.data) {
				const formattedJson = JSON.stringify(JSON.parse(jsonResponse.result.data.join('')), null, 4);
				vscode.window.showInformationMessage('JSON formatted successfully');
				resolve(formattedJson);
			} else {
				vscode.window.showErrorMessage('Failed to format JSON');
				reject()
			}
		})
		.catch(error => {
			vscode.window.showErrorMessage('Failed to format JSON');
			reject(error)
		});
    });
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.formatJson', async function () {
        let editor = vscode.window.activeTextEditor;
        if (editor) {
            let document = editor.document;
            let selection = editor.selection;

            let text = document.getText(selection);

            if (text.length === 0) {
                vscode.window.showInformationMessage('No JSON selected.');
                return;
            }

            try {
                let formattedJson = await formatJson(text);
                editor.edit(editBuilder => {
                    editBuilder.replace(selection, formattedJson);
                });
            } catch (e) {
                vscode.window.showErrorMessage('Failed to format JSON');
            }
        }
    });

    context.subscriptions.push(disposable);
}
// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate,
	formatJson
}

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function hideMsg(nsg,timeout=5000){
	setTimeout(() => {
		nsg.dispose();
	}, timeout);
}
function formatJson(jsonStr) {
	jsonStr = JSON.stringify(jsonStr)
    return new Promise((resolve, reject) => {
		fetch("https://jsonformatter.curiousconcept.com/process", {
			"headers": {
				"accept": "application/json, text/javascript, */*; q=0.01",
				"accept-language": "en-US,en;q=0.9,fr;q=0.8,ar;q=0.7",
				"content-type": "application/x-www-form-urlencoded; charset=UTF-8",
				"sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
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
			"body": `data=${encodeURIComponent(jsonStr)}&jsontemplate=2&jsonspec=4&jsonfix=on&autoprocess=&version=2`,
			"method": "POST",
			"mode": "cors",
			"credentials": "include"
		}).then(response => response.json())
		.then(jsonResponse => {
			if (jsonResponse.result && jsonResponse.result.data) {
				const formattedJson = JSON.stringify(JSON.parse(jsonResponse.result.data.join('')), null, 4);
				let msg = vscode.window.showInformationMessage('JSON formatted successfully');
				hideMsg(msg)
				resolve(formattedJson);
			} else {
				let msg =vscode.window.showErrorMessage('Failed to format JSON');
				hideMsg(msg)
				reject()
			}
		})
		.catch(error => {
			let msg =vscode.window.showErrorMessage(`Failed to format JSON ${error}`);
			hideMsg(msg)
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
				let msg = vscode.window.showInformationMessage('No JSON selected.');
				hideMsg(msg)
                return;
            }

            try {
                let formattedJson = await formatJson(text);
                editor.edit(editBuilder => {
                    editBuilder.replace(selection, formattedJson);
                });
            } catch (e) {
                let msg =vscode.window.showErrorMessage(`Failed to format JSON ${e}`);
				hideMsg(msg)
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

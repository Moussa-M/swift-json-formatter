// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
let vscode;
try {
    vscode = global.vscode || require('vscode');
} catch (e) {
    // Fallback for testing environment
    vscode = {
        window: {
            showInformationMessage: () => ({ dispose: () => {} }),
            showErrorMessage: () => ({ dispose: () => {} }),
            showWarningMessage: () => ({ dispose: () => {} }),
            activeTextEditor: null,
            messages: []
        },
        commands: {
            registerCommand: () => {}
        },
        ExtensionContext: function() {}
    };
}

/**
 * Shows a message and automatically hides it after a timeout
 * @param {string} message The message to show
 * @param {'info' | 'warning' | 'error'} type The type of message
 * @param {number} timeout Timeout in milliseconds
 */
function showMessage(message, type = 'info', timeout = 3000) {
    let disposable;
    switch (type) {
        case 'error':
            disposable = vscode.window.showErrorMessage(message);
            break;
        case 'warning':
            disposable = vscode.window.showWarningMessage(message);
            break;
        default:
            disposable = vscode.window.showInformationMessage(message);
    }

    if (vscode.window.messages) {
        vscode.window.messages.push({ message, type, timeout });
    }

    if (timeout > 0 && disposable && typeof disposable.dispose === 'function') {
        setTimeout(() => {
            try {
                disposable.dispose();
            } catch (e) {
                // Silently handle any disposal errors
            }
        }, timeout);
    }

    return disposable;
}

function formatJson(jsonStr) {
    return new Promise((resolve, reject) => {
        if (!jsonStr || !jsonStr.trim()) {
            const error = new Error('Invalid JSON: Empty input');
            showMessage(error.message, 'error');
            reject(error);
            return;
        }

        try {
            // Try to parse the input to check if it's valid JSON
            let parsed;
            try {
                // If it's already a string representation of JSON
                parsed = JSON.parse(jsonStr);
            } catch (parseError) {
                // If it's a JavaScript object/array notation, try to evaluate it
                try {
                    // Safely evaluate the string (handles cases like single quotes, unquoted keys etc)
                    parsed = Function('"use strict";return (' + jsonStr + ')')();
                } catch (evalError) {
                    throw new Error('Invalid JSON: Please check your syntax');
                }
            }

            // Format the JSON with proper indentation
            const formattedJson = JSON.stringify(parsed, null, 4);
            showMessage('JSON formatted successfully');
            resolve(formattedJson);
        } catch (error) {
            showMessage(error.message, 'error');
            reject(error);
        }
    });
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    if (!vscode || !vscode.commands) {
        return;
    }

    let disposable = vscode.commands.registerCommand('extension.formatJson', async function () {
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            showMessage('No active editor found', 'warning');
            return;
        }

        let document = editor.document;
        let selection = editor.selection;
        let text = '';

        // If no text is selected, try to format the entire document
        if (selection.isEmpty) {
            const fullRange = new vscode.Range(
                document.positionAt(0),
                document.positionAt(document.getText().length)
            );
            text = document.getText(fullRange);
            selection = new vscode.Selection(fullRange.start, fullRange.end);
        } else {
            text = document.getText(selection);
        }

        if (!text.trim()) {
            showMessage('No text to format', 'warning');
            return;
        }

        try {
            let formattedJson = await formatJson(text);
            await editor.edit(editBuilder => {
                editBuilder.replace(selection, formattedJson);
            });
        } catch (e) {
            showMessage(`Failed to format JSON: ${e.message}`, 'error');
        }
    });

    if (context && context.subscriptions) {
        context.subscriptions.push(disposable);
    }
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
    activate,
    deactivate,
    formatJson
};

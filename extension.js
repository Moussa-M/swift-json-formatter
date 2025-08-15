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

function normalizePythonJson(text) {
    // 1) Normalize Python literals to JSON
    let s = String(text)
        .replace(/\bTrue\b/g, 'true')
        .replace(/\bFalse\b/g, 'false')
        .replace(/\bNone\b/g, 'null');

    // 2) Remove Python/JS identifier(...) wrappers like HumanMessage(...)
    //    by replacing "<Ident>(" with "{"
    s = s.replace(/([A-Za-z_]\w*)\s*\(/g, '{');

    // 3) Convert the matching ")" that close those wrappers into "}"
    //    when followed by a comma, closing bracket, or closing brace.
    s = s.replace(/\)(\s*[,\]}])/g, '}$1');

    // 4) Convert keyword-arg style "key=value" into JSON '"key": value'
    s = s.replace(/([A-Za-z_]\w*)\s*=/g, '"$1": ');

    // 5) Ensure unquoted dict keys become quoted: { key: ... } -> { "key": ... }
    s = s.replace(/([{,]\s*)([A-Za-z_]\w*)(\s*:)/g, '$1"$2"$3');

    // 6) Convert single quotes to double quotes (strings/keys)
    s = s.replace(/'/g, '"');

    // 7) Try to parse as JSON; if that fails, try a safe eval fallback, then return pretty JSON
    try {
        const parsed = JSON.parse(s);
        return JSON.stringify(parsed, null, 4);
    } catch(_) {
        try {
            const parsed = Function('return ' + s)();
            return JSON.stringify(parsed, null, 4);
        } catch(_) {
            // As a last resort, return best-effort string
            return s;
        }
    }
}


function unescapeJsonString(text) {
    // Remove escaped quotes and other common escape sequences
    return text
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'")
        .replace(/\\\\/g, '\\')
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t');
}

function extractAndFormatJsonSections(text) {
    // Find potential JSON sections in the text
    const jsonSections = [];
    let currentLine = '';
    let inJson = false;
    let jsonStart = -1;
    let bracketCount = 0;
    let inString = false;
    let escapeNext = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        currentLine += char;

        if (escapeNext) {
            escapeNext = false;
            continue;
        }

        if (char === '\\') {
            escapeNext = true;
            continue;
        }

        if (char === '"' || char === "'") {
            inString = !inString;
            continue;
        }

        if (!inString) {
            if (char === '{' || char === '[') {
                if (bracketCount === 0) {
                    jsonStart = i;
                }
                bracketCount++;
                inJson = true;
            } else if (char === '}' || char === ']') {
                bracketCount--;
                if (bracketCount === 0 && inJson) {
                    jsonSections.push({
                        start: jsonStart,
                        end: i + 1,
                        text: text.substring(jsonStart, i + 1)
                    });
                    inJson = false;
                }
            }
        }

        if (char === '\n' || i === text.length - 1) {
            currentLine = '';
        }
    }

    // No JSON sections found, return original text
    if (jsonSections.length === 0) {
        return text;
    }

    // Format each JSON section
    let result = '';
    let lastIndex = 0;

    for (const section of jsonSections) {
        // Add text before JSON section
        result += text.substring(lastIndex, section.start);
        
        try {
            // Normalize Python-style literals and try to format
            const normalizedJson = normalizePythonJson(section.text);
            const formattedJson = JSON.stringify(Function('return ' + normalizedJson)(), null, 4);
            result += formattedJson;
        } catch (e) {
            // If formatting fails, keep original text
            result += section.text;
        }
        
        lastIndex = section.end;
    }

    // Add remaining text after last JSON section
    result += text.substring(lastIndex);

    return result;
}

function formatJson(jsonStr) {
    return new Promise((resolve, reject) => {
        if (!jsonStr || !jsonStr.trim()) {
            reject(new Error('Invalid JSON: Empty input'));
            return;
        }

        try {
            // First unescape any escaped JSON strings
            const unescapedJson = unescapeJsonString(jsonStr);
            
            // First try to parse as a complete JSON
            try {
                const normalizedJson = normalizePythonJson(unescapedJson);
                const parsed = JSON.parse(normalizedJson);
                resolve(JSON.stringify(parsed, null, 4));
                return;
            } catch (parseError) {
                try {
                    // Try to evaluate as a JavaScript object
                    const normalizedJson = normalizePythonJson(unescapedJson);
                    const parsed = Function('return ' + normalizedJson)();
                    resolve(JSON.stringify(parsed, null, 4));
                    return;
                } catch (evalError) {
                    // If both fail, try to extract and format JSON sections
                    const formattedSections = extractAndFormatJsonSections(unescapedJson);
                    // If no JSON sections were found and the input looks like it should be JSON
                    if (formattedSections === unescapedJson && (unescapedJson.includes('{') || unescapedJson.includes('['))) {
                        reject(new Error('Invalid JSON: Please check your syntax'));
                        return;
                    }
                    resolve(formattedSections);
                    return;
                }
            }
        } catch (error) {
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

        // Check if there is selected text
        if (!selection.isEmpty) {
            // Format only the selected text
            let text = document.getText(selection);
            if (!text.trim()) {
                showMessage('Selected text is empty', 'warning');
                return;
            }
            try {
                let formattedJson = await formatJson(text);
                await editor.edit(editBuilder => {
                    editBuilder.replace(selection, formattedJson);
                });
                showMessage('Selected JSON formatted successfully');
            } catch (e) {
                showMessage(e.message, 'error');
            }
        } else {
            // Format the entire document
            const fullRange = new vscode.Range(
                document.positionAt(0),
                document.positionAt(document.getText().length)
            );
            let text = document.getText(fullRange);
            if (!text.trim()) {
                showMessage('Document is empty', 'warning');
                return;
            }
            try {
                let formattedJson = await formatJson(text);
                await editor.edit(editBuilder => {
                    editBuilder.replace(fullRange, formattedJson);
                });
                showMessage('Document JSON formatted successfully');
            } catch (e) {
                showMessage(e.message, 'error');
            }
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


# Swift JSON Formatter for VS Code

A fast, reliable, and feature-rich JSON formatter extension for Visual Studio Code that handles various JSON formats and provides clear error messages.

## Features

- **Local Processing**: All formatting is done locally - no external services required
- **Multiple JSON Formats Support**:
  - Standard JSON
  - JavaScript object notation (unquoted keys)
  - Single quotes
  - Trailing commas
- **Smart Selection**:
  - Format selected JSON text
  - Format entire file when no text is selected
- **Clear Error Messages**: Helpful error messages when JSON is invalid
- **Zero Configuration**: Works out of the box with sensible defaults

## Usage

You can format JSON in two ways:

1. Using Command Palette:
   - Select a JSON string in your editor (or place cursor anywhere in a JSON file)
   - Open the command palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on Mac)
   - Type and select "Format JSON (Swift Json Formatter)"

2. Using Keyboard Shortcut:
   - Select a JSON string (or place cursor anywhere in a JSON file)
   - Press `Ctrl+Shift+F F` (or `Cmd+Shift+F F` on Mac)

The extension will automatically:
- Format the selected text if any is selected
- Format the entire file if no text is selected
- Provide clear error messages if the JSON is invalid

## Examples

### Standard JSON
```json
{"name":"test","value":123}
```
becomes:
```json
{
    "name": "test",
    "value": 123
}
```

### JavaScript Object Notation
```javascript
{name: 'test', value: 123}
```
becomes:
```json
{
    "name": "test",
    "value": 123
}
```

## Release Notes

### 1.1.0 (2024-01-09)

Major update with new features:
- Local JSON processing (no more external service dependency)
- Support for JavaScript object notation
- Support for single quotes in JSON
- Support for trailing commas
- Comprehensive error messages
- Full test coverage
- Improved error handling and validation
- Better handling when no text is selected

### 1.0.4
- Initial release with basic JSON formatting

## Feedback and Contributions

- File bugs and feature requests in our [GitHub repository](https://github.com/Moussa-M/swift-json-formatter)
- Contributions are always welcome!

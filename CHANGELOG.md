# Change Log

All notable changes to the "swift-json-formatter" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.2.1] - 2024-01-10

### Fixed
- Add support for Python-style boolean values (`True`, `False`, `None`)
- Fix formatting of JSON sections containing Python-style literals

## [1.2.0] - 2024-01-10

### Added
- Smart JSON extraction from unstructured text
- Support for formatting JSON sections within logs or other text content
- Improved handling of mixed content (JSON and non-JSON)
- New unit tests for mixed content formatting

### Changed
- Enhanced JSON detection and formatting algorithm
- Better error handling for invalid JSON sections
- Improved feedback messages for different formatting scenarios

## [1.1.3] - 2024-01-09

### Changed
- Updated keyboard shortcut to `Ctrl+Shift+F` (or `Cmd+Shift+F` on Mac) for better usability

## [1.1.1] - 2024-01-09

### Added
- Keyboard shortcut: `Ctrl+Shift+F F` (or `Cmd+Shift+F F` on Mac) for quick formatting

## [1.1.0] - 2024-01-09

### Added
- Local JSON processing (no more external service dependency)
- Support for JavaScript object notation
- Support for single quotes in JSON
- Support for trailing commas
- Comprehensive error messages
- Full test coverage

### Changed
- Improved error handling and validation
- Better handling of empty or whitespace-only input
- Enhanced code organization and readability

### Fixed
- Fixed handling of malformed JSON
- Fixed handling when no text is selected (formats entire document)

## [1.0.4] - Initial release
- Basic JSON formatting functionality
const assert = require('assert');

// Mock the vscode module
const vscode = {
    window: {
        showInformationMessage: () => ({ dispose: () => {} }),
        showErrorMessage: () => ({ dispose: () => {} })
    }
};

// Import only the formatJson function
const formatJsonModule = require('../../extension.js');
const { formatJson } = formatJsonModule;

describe('JSON Formatter Tests', () => {
    it('should format basic JSON correctly', async () => {
        const input = '{"success":true,"id":"XX0b4a09db4F7730c40ab0D5","nested":{}}';
        const expected = `{
    "success": true,
    "id": "XX0b4a09db4F7730c40ab0D5",
    "nested": {}
}`;
        const result = await formatJson(input);
        assert.strictEqual(result, expected);
    });

    it('should handle complex nested JSON', async () => {
        const input = JSON.stringify({
            success: true,
            data: {
                items: [1,2,3],
                metadata: { type: 'test' }
            }
        });
        const expected = `{
    "success": true,
    "data": {
        "items": [
            1,
            2,
            3
        ],
        "metadata": {
            "type": "test"
        }
    }
}`;
        const result = await formatJson(input);
        assert.strictEqual(result, expected);
    });

    it('should handle JavaScript object notation', async () => {
        const input = "{success: true, id: 'test-123', items: [1,2,3]}";
        const expected = `{
    "success": true,
    "id": "test-123",
    "items": [
        1,
        2,
        3
    ]
}`;
        const result = await formatJson(input);
        assert.strictEqual(result, expected);
    });

    it('should handle trailing commas', async () => {
        const input = '{"name": "test", "value": 123,}';
        const expected = `{
    "name": "test",
    "value": 123
}`;
        const result = await formatJson(input);
        assert.strictEqual(result, expected);
    });

    it('should handle single quotes', async () => {
        const input = "{'name': 'test', 'value': 123}";
        const expected = `{
    "name": "test",
    "value": 123
}`;
        const result = await formatJson(input);
        assert.strictEqual(result, expected);
    });

    it('should throw error for invalid JSON', async () => {
        const input = '{"name": "test", invalid}';
        try {
            await formatJson(input);
            assert.fail('Should have thrown an error for invalid JSON');
        } catch (error) {
            assert(error.message.includes('Invalid JSON'));
        }
    });

    it('should throw error for empty input', async () => {
        try {
            await formatJson('');
            assert.fail('Should have thrown an error for empty input');
        } catch (error) {
            assert(error.message.includes('Invalid JSON'));
        }
    });

    it('should throw error for whitespace only input', async () => {
        try {
            await formatJson('   \n   \t   ');
            assert.fail('Should have thrown an error for whitespace only input');
        } catch (error) {
            assert(error.message.includes('Invalid JSON'));
        }
    });
});
const assert = require("assert");
const vscode = require("vscode");
const { formatJson } = require(__dirname + "/../../extension.js");

suite("JSON Formatter Test Suite", () => {
    vscode.window.showInformationMessage("Starting JSON formatter tests.");

    test("Basic JSON formatting", async () => {
        const inputData = '{"success":true,"id":"XX0b4a09db4F7730c40ab0D5","nested":{}}';
        const expectedOutput = `{
    "success": true,
    "id": "XX0b4a09db4F7730c40ab0D5",
    "nested": {}
}`;
        const output = await formatJson(inputData);
        assert.strictEqual(output, expectedOutput);
    });

    test("Complex nested JSON", async () => {
        const inputData = {'success': true, 'data': {'items': [1,2,3], 'metadata': {'type': 'test'}}};
        const expectedOutput = `{
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
        const output = await formatJson(JSON.stringify(inputData));
        assert.strictEqual(output, expectedOutput);
    });

    test("JavaScript object notation", async () => {
        const inputData = "{success: true, id: 'test-123', items: [1,2,3]}";
        const expectedOutput = `{
    "success": true,
    "id": "test-123",
    "items": [
        1,
        2,
        3
    ]
}`;
        const output = await formatJson(inputData);
        assert.strictEqual(output, expectedOutput);
    });

    test("Handle trailing commas", async () => {
        const inputData = '{"name": "test", "value": 123,}';
        const expectedOutput = `{
    "name": "test",
    "value": 123
}`;
        const output = await formatJson(inputData);
        assert.strictEqual(output, expectedOutput);
    });

    test("Handle single quotes", async () => {
        const inputData = "{'name': 'test', 'value': 123}";
        const expectedOutput = `{
    "name": "test",
    "value": 123
}`;
        const output = await formatJson(inputData);
        assert.strictEqual(output, expectedOutput);
    });

    test("Invalid JSON should throw error", async () => {
        const inputData = '{"name": "test", invalid}';
        try {
            await formatJson(inputData);
            assert.fail("Should have thrown an error for invalid JSON");
        } catch (error) {
            assert(error.message.includes("Invalid JSON"));
        }
    });

    test("Empty input should throw error", async () => {
        try {
            await formatJson("");
            assert.fail("Should have thrown an error for empty input");
        } catch (error) {
            assert(error.message.includes("Invalid JSON"));
        }
    });

    test("Whitespace only input should throw error", async () => {
        try {
            await formatJson("   \n   \t   ");
            assert.fail("Should have thrown an error for whitespace only input");
        } catch (error) {
            assert(error.message.includes("Invalid JSON"));
        }
    });
});

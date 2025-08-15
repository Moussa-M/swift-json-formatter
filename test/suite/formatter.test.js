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

    it('should sanitize Python objects to valid JSON', async () => {
        const input = `{'messages': [{'content': 'this is a test msg', 'additional_kwargs': {}, 'response_metadata': {}, 'id': '2f08c048-642f-443b-a456-ea929f7ffb3f', 'metadata': {'has_files': False, 'timestamp': '2025-08-15T14:16:06.147Z'}}]}`;
        const expected = `{
    "messages": [
        {
            "content": "this is a test msg",
            "additional_kwargs": {},
            "response_metadata": {},
            "id": "2f08c048-642f-443b-a456-ea929f7ffb3f",
            "metadata": {
                "has_files": false,
                "timestamp": "2025-08-15T14:16:06.147Z"
            }
        }
    ]
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

    it('should format JSON sections in unstructured text', async () => {
        const input = `Debug Token Response: 
{'data': {'app_id': '1075719490761124', 'type': 'USER'}}
Status: Success
Another response: {"status": "ok", "code": 200}`;
        const expected = `Debug Token Response: 
{
    "data": {
        "app_id": "1075719490761124",
        "type": "USER"
    }
}
Status: Success
Another response: {
    "status": "ok",
    "code": 200
}`;
        const result = await formatJson(input);
        assert.strictEqual(result, expected);
    });

    it('should handle complex nested JSON in unstructured text', async () => {
        const input = `Response: {'data': [{'verified_name': 'Test', 'code_verification_status': 'EXPIRED'}], 'paging': {'cursors': {'before': 'abc', 'after': 'xyz'}}}
Status: Done`;
        const expected = `Response: {
    "data": [
        {
            "verified_name": "Test",
            "code_verification_status": "EXPIRED"
        }
    ],
    "paging": {
        "cursors": {
            "before": "abc",
            "after": "xyz"
        }
    }
}
Status: Done`;
        const result = await formatJson(input);
        assert.strictEqual(result, expected);
    });

    it('should preserve non-JSON text', async () => {
        const input = `Start of text
Middle section: not json here
End of text`;
        const result = await formatJson(input);
        assert.strictEqual(result, input);
    });

    it('should handle Python-style literals', async () => {
        const input = `{'success': True, 'active': False, 'value': None}`;
        const expected = `{
    "success": true,
    "active": false,
    "value": null
}`;
        const result = await formatJson(input);
        assert.strictEqual(result, expected);
    });

    it('should handle Python-style literals in mixed content', async () => {
        const input = `Debug Response: {'status': True, 'data': None}
Other info: not JSON
Result: {'success': False}`;
        const expected = `Debug Response: {
    "status": true,
    "data": null
}
Other info: not JSON
Result: {
    "success": false
}`;
        const result = await formatJson(input);
        assert.strictEqual(result, expected);
    });

    it('should handle escaped JSON strings', async () => {
        const input = `[{\"type\":\"cases\",\"default\":\"0\",\"cases\":[{\"type\":\"case\",\"when\":\"company_competition < 21\",\"then\":\"1\"}]}]`;
        const expected = `[
    {
        "type": "cases",
        "default": "0",
        "cases": [
            {
                "type": "case",
                "when": "company_competition < 21",
                "then": "1"
            }
        ]
    }
]`;
        const result = await formatJson(input);
        assert.strictEqual(result, expected);
    });

    it('should handle complex nested cases structure with escaped quotes', async () => {
        const input = `[{\"type\":\"cases\",\"default\":\"0\",\"cases\":[{\"type\":\"case\",\"when\":\"company_competition < 21\",\"then\":\"1\"},{\"type\":\"case\",\"when\":\"company_competition >= 21 and company_competition <= 60\",\"then\":\"2\"},{\"type\":\"case\",\"when\":\"company_competition > 60\",\"then\":\"3\"}]},{\"type\":\"cases\",\"default\":\"0\",\"cases\":[{\"type\":\"case\",\"when\":\"company_seats_filled < 51\",\"then\":\"1\"},{\"type\":\"case\",\"when\":\"company_seats_filled >= 51 and company_seats_filled <= 80\",\"then\":\"2\"},{\"type\":\"case\",\"when\":\"company_seats_filled > 80\",\"then\":\"3\"}]}]`;
        const expected = `[
    {
        "type": "cases",
        "default": "0",
        "cases": [
            {
                "type": "case",
                "when": "company_competition < 21",
                "then": "1"
            },
            {
                "type": "case",
                "when": "company_competition >= 21 and company_competition <= 60",
                "then": "2"
            },
            {
                "type": "case",
                "when": "company_competition > 60",
                "then": "3"
            }
        ]
    },
    {
        "type": "cases",
        "default": "0",
        "cases": [
            {
                "type": "case",
                "when": "company_seats_filled < 51",
                "then": "1"
            },
            {
                "type": "case",
                "when": "company_seats_filled >= 51 and company_seats_filled <= 80",
                "then": "2"
            },
            {
                "type": "case",
                "when": "company_seats_filled > 80",
                "then": "3"
            }
        ]
    }
]`;
        const result = await formatJson(input);
        assert.strictEqual(result, expected);
    });
    it('should handle python objects', async () => {
        const input = `{'messages': [HumanMessage(content='this is a test msg', additional_kwargs={}, response_metadata={}, id='2f08c048-642f-443b-a456-ea929f7ffb3f', metadata={'has_files': False, 'timestamp': '2025-08-15T14:16:06.147Z'})]}`;
        const expected = `{
    "messages": [
        {
            "content": "this is a test msg",
            "additional_kwargs": {},
            "response_metadata": {},
            "id": "2f08c048-642f-443b-a456-ea929f7ffb3f",
            "metadata": {
                "has_files": false,
                "timestamp": "2025-08-15T14:16:06.147Z"
            }
        }
    ]
}`;
        const result = await formatJson(input);
        assert.strictEqual(result, expected);
    });
});

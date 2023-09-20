const assert = require("assert");
const vscode = require("vscode");
const { formatJson } = require(__dirname + "/../../extension.js");

suite("Extension Test Suite", () => {
	vscode.window.showInformationMessage("Start all tests.");

	test("formatJson test", async () => {
		const inputData =
			'{"success":True,"Id":"XX0b4a09db4F7730c40ab0D5","nested":{},}';
		const expectedOutput = `{
    "success": true,
    "Id": "XX0b4a09db4F7730c40ab0D5",
    "nested": {}
}`;

		try {
			let output = await formatJson(inputData);
			assert.strictEqual(
				output,
				expectedOutput,
				"Output:\n" +
				output.toString() +
				"\nss not equal to\n Expected:\n" +
				expectedOutput.toString() +
				"\n"
			);
		} catch (error) {
			assert.fail(`formatJson threw an error: ${error.message}`);
		}
	});
});

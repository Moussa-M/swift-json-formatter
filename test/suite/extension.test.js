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
suite("Extension Test Suite 2", () => {
    vscode.window.showInformationMessage("Start all tests.");

    test("formatJson test", async () => {
        const inputData =
            {'success': true, 'session_id': '650d71558d41fd884f6cfcac', 'api': {'provider_info': {'name': 'salesforce', 'display_name': 'Salesforce', 'url': 'https://www.salesforce.com/', 'image': 'https://api.nyc3.cdn.digitaloceanspaces.com/integration/salesforce.png', 'auth_type': 'oauth', 'specific': {}, 'api_provider_type': 'CRM', 'rating': 90, 'review': "Salesforce is undoubtedly one of the best CRMs available due to its customization and versatility. The platform offers a wide range of objects, and the ability to retrieve their fields using an endpoint is extremely useful, making it a feature that every provider should offer. However, the platform's complexity may cause some users to experience difficulties, and it's easy to get lost in the documentation. Despite this, it's worth taking the time to understand the platform's flexibility and capabilities. Moreover, Salesforce offers OAuth as an authentication method, which is a secure and seamless option that enhances the overall user experience."}}, 'metadata': {'user_id': 'd862f967-6e47-4c36-92fc-9a6ea6d72b6e', 'event_type': 'configuration'}};
        const expectedOutput = `{
    "success": true,
    "session_id": "650d71558d41fd884f6cfcac",
    "api": {
        "provider_info": {
            "name": "salesforce",
            "display_name": "Salesforce",
            "url": "https://www.salesforce.com/",
            "image": "https://api.nyc3.cdn.digitaloceanspaces.com/integration/salesforce.png",
            "auth_type": "oauth",
            "specific": {},
            "api_provider_type": "CRM",
            "rating": 90,
            "review": "Salesforce is undoubtedly one of the best CRMs available due to its customization and versatility. The platform offers a wide range of objects, and the ability to retrieve their fields using an endpoint is extremely useful, making it a feature that every provider should offer. However, the platform's complexity may cause some users to experience difficulties, and it's easy to get lost in the documentation. Despite this, it's worth taking the time to understand the platform's flexibility and capabilities. Moreover, Salesforce offers OAuth as an authentication method, which is a secure and seamless option that enhances the overall user experience."
        }
    },
    "metadata": {
        "user_id": "d862f967-6e47-4c36-92fc-9a6ea6d72b6e",
        "event_type": "configuration"
    }
}`;

        try {
            let output = await formatJson(JSON.stringify(inputData));
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

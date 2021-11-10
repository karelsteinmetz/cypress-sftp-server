# cypress-sftp-server

Cypress plugin for SFTP server.

## Adding to project

Add following lines to your _commands.ts_:

```tsx
/// <reference types="Cypress plugin for SFTP server" />

import "cypress-sftp-server/commands";
```

Add following lines to your _plugins/index.ts_:

```tsx
// plugins file

import sftpServer from "cypress-sftp-server/plugin";

function register(on: Cypress.PluginEvents): void {
    sftpServer(on);
}

export = register;
```

## Usage

For upload call.

```tsx
describe("SFTP server", () => {
    const debug = true;
    const rootDir = "sftp_server_client_test";
    const connectionSettings = {
        host: "127.0.0.1",
        port: 22,
        userName: "userTest",
        password: "secret1",
        dir: rootDir,
    };

    const dirInput = "input";
    const fileName = dirInput + "/test.txt";

    before(() => {
        cy.sftpStart({ debug }).then((r) => {
            connectionSettings.host = r.server.host;
            connectionSettings.port = r.server.port;
        });
    });

    after(() => {
        cy.sftpStop({ debug });
    });

    it("connects by client", () => {
        cy.log("connection settings:", JSON.stringify(connectionSettings));
        cy.sftpCreateDirectory({
            debug,
            connectionSettings,
            directoryName: [dirInput],
        }).then((r) => {
            cy.log("sftpCreateDirectory result", r);
        });
        cy.sftpUpload({
            debug,
            connectionSettings,
            content: "content",
            fileName,
        }).then((r) => {
            cy.log("sftpUpload result", r);
        });
        cy.sftpExists({
            debug,
            connectionSettings,
            fileName,
        }).then((r) => {
            cy.log("sftpExists result", r);
            expect(r.isExisting).is.be.true;
        });
        cy.sftpList({
            debug,
            directory: dirInput,
            connectionSettings,
        }).then((r) => {
            cy.log("sftpList result", r);
        });
        cy.sftpDownload({
            debug,
            connectionSettings,
            fileName: fileName,
        }).then((r) => {
            cy.log("sftpDownload result", r);
        });
        cy.sftpDelete({
            debug,
            connectionSettings,
            fileNames: [fileName],
        }).then((r) => {
            cy.log("sftpDelete result", r);
        });
    });
});

```

## How to Develope

To build plugin run webpack with specific config:

```bash
npx webpack --config webpack.config.plugin.ts -w
```

and then run cypress:

```bash
npx cypress open
```

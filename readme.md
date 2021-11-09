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
cy.sftpStart({
    debug: true,
    connectionSettings: {
        host: "localhost",
        port: 22,
        userName: "test1",
        password: "secret1",
    },
});

cy.sftpStop();
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

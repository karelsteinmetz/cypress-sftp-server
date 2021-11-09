/// <reference path="common.d.ts" />

import { sftpStart, sftpStop } from "./sftpServerCore";

function register(on: Cypress.PluginEvents): void {
    on("task", {
        async sftpStart(config: ISftpStartOptions): Promise<ISftpStartResult> {
            return await sftpStart(config);
        },
        async sftpStop(config: ISftpStopOptions): Promise<ISftpStopResult> {
            return await sftpStop(config);
        },
    });
}

export = register;

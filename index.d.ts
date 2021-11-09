/// <reference types="cypress" />
/// <reference path="plugin/common.d.ts" />

interface ISftpStartCommandOptions extends Partial<Cypress.Loggable & Cypress.Timeoutable>, IDebugSftpOptions {
    port?: number;
}
interface ISftpStopCommandOptions extends Partial<Cypress.Loggable & Cypress.Timeoutable>, ISftpStopOptions {}

declare namespace Cypress {
    interface ResolvedConfigOptions {
        sftpServerDebugLog: string;
    }

    interface Chainable<Subject> {
        sftpStart(config: ISftpStartCommandOptions): Cypress.Chainable<ISftpStartResult>;
        sftpStop(config: ISftpStopCommandOptions): Cypress.Chainable<ISftpStopResult>;
    }
}

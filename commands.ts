/// <reference path="./index.d.ts" />

interface ICypressLogOptions {
    _log: Cypress.Log;
}

interface ISftpStartCommandOptionsWithLog extends ISftpStartCommandOptions, ICypressLogOptions {}

Cypress.Commands.add(
    "sftpStart",
    (options: ISftpStartCommandOptions): Cypress.Chainable<ISftpStartResult> => {
        const cmdOptions: ISftpStartCommandOptionsWithLog = Object.assign(
            typeof options === "object" ? options : ({} as ISftpStartCommandOptionsWithLog),
            {
                _log: Cypress.log({ message: [name] }),
            }
        );

        const sftpServerConfig = Cypress.config("sftpServer");

        return cy
            .task(
                "sftpStart",
                <ISftpStartOptions>{
                    port: options?.port,
                    hostKeys: sftpServerConfig?.hostKeys,
                    debug: options.debug,
                    serverLogDirPath: sftpServerConfig?.logPath,
                },
                Object.assign(cmdOptions, { log: true })
            )
            .then((result) => (result as any) as ISftpStartResult)
            .then((report) => sftpServerResultLog(cmdOptions, report))
            .should((report) => expect(report.status, `Report status assertion. Report object is: ${JSON.stringify(report)}`).to.be.true);
    }
);

interface ISftpStopCommandOptionsWithLog extends ISftpStopCommandOptions, ICypressLogOptions {}

Cypress.Commands.add(
    "sftpStop",
    (options: ISftpStopCommandOptions): Cypress.Chainable<ISftpStopResult> => {
        const cmdOptions: ISftpStopCommandOptionsWithLog = Object.assign(
            typeof options === "object" ? options : ({} as ISftpStopCommandOptionsWithLog),
            {
                _log: Cypress.log({ message: [name] }),
            }
        );

        return cy
            .task(
                "sftpStop",
                <ISftpStopOptions>{
                    debug: options.debug,
                },
                Object.assign(cmdOptions, { log: true })
            )
            .then((result) => (result as any) as ISftpStopResult)
            .then((report) => sftpServerResultLog(cmdOptions, report))
            .should((report) => expect(report.status, `Report status assertion. Report object is: ${JSON.stringify(report)}`).to.be.true);
    }
);

function sftpServerResultLog<TResult extends ISftpResultBase>(options: ICypressLogOptions, report: TResult): TResult {
    const consoleProps = Object.assign({
        Status: report.status,
        Error: report.error,
    });

    options._log.set({ consoleProps: () => consoleProps });
    return report;
}

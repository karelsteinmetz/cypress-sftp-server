/// <reference path="common.d.ts" />

import * as ssh2 from "ssh2";
import * as path from "path";
import * as fs from "fs";
import * as fsLogger from "./fsLogger";

const SftpServer = require("ssh2-sftp-server");

let server: ssh2.Server;

export async function sftpStart(config: ISftpStartOptions): Promise<ISftpStartResult | PromiseLike<ISftpStartResult>> {
    let serverLogger: fsLogger.IServerLogger | undefined;
    if (config.serverLogDirPath !== undefined) {
        serverLogger = fsLogger.createLogger(config.serverLogDirPath);
    }

    debugLog(config, "SFTP Server is starting...");
    return new Promise<ISftpStartResult>((f, r) => {
        let host = "";
        let port = config.port || 0;
        let family = "";
        try {
            server = new ssh2.Server(
                {
                    debug: (message: string) => {
                        serverLogger?.log(message);
                    },
                    hostKeys: config.hostKeys
                        ? config.hostKeys.map((k) => {
                              debugLog(config, "Server configured with host key", k.keyPath);
                              return {
                                  key: fs.readFileSync(k.keyPath),
                                  passphrase: k.passphrase,
                              };
                          })
                        : [
                              {
                                  key: fs.readFileSync(path.resolve(__dirname, "privateKey.ppk")),
                                  passphrase: "test",
                              },
                          ],
                },
                (client: ssh2.Connection, clientInfo: ssh2.ClientInfo) => {
                    debugLog(config, `New client connecting...`, clientInfo);
                    client
                        .on("error", (e) => debugLog(config, "error: ", e))
                        .on("authentication", async function (ctx) {
                            debugLog(config, "Authentication accepting started...");
                            debugLog(config, `User ${ctx.username} attempting to authenticate with method= ${ctx.method}`);
                            if (ctx.method === "none") {
                                ctx.accept();
                                debugLog(config, `Authentication accepted by method ${ctx.method}.`);
                                return;
                            } else {
                                ctx.reject(["password"]);
                            }
                            ctx.accept();
                            debugLog(config, "Authentication accepted.");
                        })
                        .on("ready", function () {
                            debugLog(config, "Client is authenticated!");
                            client.on("session", (accept) => {
                                debugLog(config, "Session accepting started...");
                                let session = accept();
                                debugLog(config, "Session accepted.", session);
                                session.on("sftp", function (accept) {
                                    debugLog(config, "Session stream accepting started...");
                                    const sftpStream = accept();
                                    debugLog(config, "Session stream accepted.", session);
                                    if (!sftpStream) {
                                        return;
                                    }
                                    new SftpServer(sftpStream);
                                });
                            });
                        })
                        .on("end", function () {
                            debugLog(config, "Client was disconnected.");
                        });
                }
            );

            server.listen(port, () => {
                const address = server.address();
                family = address.family;
                port = address.port;
                host = address.address;
                debugLog(config, "Listening on: " + host + ":" + port, family);

                f({
                    server: {
                        host,
                        port,
                        family,
                    },
                    status: true,
                });
            });
        } catch (error) {
            r({
                server: {
                    host,
                    port,
                    family,
                },
                status: false,
                error: error + "",
            });
        }
    });
}

export async function sftpStop(config: ISftpStopOptions): Promise<ISftpStopResult> {
    debugLog(config, "SFTP Server is stopping...");
    return new Promise<ISftpStopResult>((f, _r) => {
        if (server === undefined) {
            debugLog(config, "SFTP Server was checked for stop but did not run/created.");
            f({ status: true });
            return;
        }

        server.close();
        debugLog(config, "SFTP Server was stopped.");
        f({ status: true });
    });
}

function debugLog(config: IDebugSftpOptions, message?: any, ...optionalParams: any[]): void {
    config.debug && console.log(message, ...optionalParams);
}

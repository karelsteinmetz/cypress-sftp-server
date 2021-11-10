/// <reference path="common.d.ts" />

import * as ssh2 from "ssh2";
import * as path from "path";
import * as fs from "fs";

const SftpServer = require("ssh2-sftp-server");

let server: ssh2.Server;

export async function sftpStart(config: ISftpStartOptions): Promise<ISftpStartResult | PromiseLike<ISftpStartResult>> {
    log(config, "SFTP Server is starting...");
    return new Promise<ISftpStartResult>((f, r) => {
        let host = "";
        let port = config.port || 0;
        let family = "";

        try {
            server = new ssh2.Server(
                {
                    debug: (message: string) => {
                        log(config, message);
                    },
                    hostKeys: config.hostKeys
                        ? config.hostKeys.map((k) => {
                              log(config, "Server configured with host key", k.keyPath);
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
                    log(config, `New client connecting...`, clientInfo);
                    client
                        .on("error", (e) => log(config, "error: ", e))
                        .on("authentication", async function (ctx) {
                            log(config, "Authentication accepting started...");
                            log(config, `User ${ctx.username} attempting to authenticate with method= ${ctx.method}`);
                            if (ctx.method === "none") {
                                ctx.accept();
                                log(config, `Authentication accepted by method ${ctx.method}.`);
                                return;
                            } else {
                                ctx.reject(["password"]);
                            }
                            ctx.accept();
                            log(config, "Authentication accepted.");
                        })
                        .on("ready", function () {
                            log(config, "Client is authenticated!");
                            client.on("session", (accept) => {
                                log(config, "Session accepting started...");
                                let session = accept();
                                log(config, "Session accepted.", session);
                                session.on("sftp", function (accept) {
                                    log(config, "Session stream accepting started...");
                                    const sftpStream = accept();
                                    log(config, "Session stream accepted.", session);
                                    if (!sftpStream) {
                                        return;
                                    }
                                    new SftpServer(sftpStream);
                                });
                            });
                        })
                        .on("end", function () {
                            log(config, "Client was disconnected.");
                        });
                }
            );

            server.listen(port, () => {
                const address = server.address();
                family = address.family;
                port = address.port;
                host = address.address;
                log(config, "Listening on: " + host + ":" + port, family);

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
    log(config, "SFTP Server is stopping...");
    return new Promise<ISftpStopResult>((f, _r) => {
        if (server === undefined) {
            log(config, "SFTP Server was checked for stop but did not run/created.");
            f({ status: true });
            return;
        }

        server.close();
        log(config, "SFTP Server was stopped.");
        f({ status: true });
    });
}

function log(config: IDebugSftpOptions, message?: any, ...optionalParams: any[]): void {
    config.debug && console.log(message, ...optionalParams);
}

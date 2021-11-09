/// <reference path="common.d.ts" />

import * as ssh2 from "ssh2";
import * as path from "path";
import * as fs from "fs";

const SftpServer = require("ssh2-sftp-server");

let server: ssh2.Server;

export async function sftpStart(config: ISftpStartOptions): Promise<ISftpStartResult | PromiseLike<ISftpStartResult>> {
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
                    log(config, `New client connecting...`, client, clientInfo);
                    client
                        .on("error", (e) => log(config, "error: ", e))
                        .on("authentication", async function (ctx) {
                            log(config, "Authentication accepting started...", ctx);
                            log(config, `User ${ctx.username} attempting to authenticate with method= ${ctx.method}`);
                            let username;
                            let password;
                            if (ctx.method === "none") {
                                ctx.accept();
                                log(config, `Authentication accepted by method ${ctx.method}.`);
                                return;
                            }
                            if (ctx.method === "password") {
                                username = ctx.username;
                                password = ctx.password;

                                try {
                                    await doSomeAuthorization(username, password);

                                    ctx.accept();
                                } catch (e) {
                                    console.error(e);
                                    ctx.reject(["password"]);
                                    client.end();
                                }
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
                                    const sftpStream = accept();
                                    console.log("SftpStream: ", sftpStream);
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
    log(config, "sftpStop", server, SftpServer);
    return new Promise<ISftpStopResult>((f, _e) => {
        if (server !== undefined) {
            server.close();
        }
        f({ status: true });
    });
}

function log(config: IDebugSftpOptions, message?: any, ...optionalParams: any[]): void {
    config.debug && console.log(message, ...optionalParams);
}

function doSomeAuthorization(username: string, password: string): Promise<void> {
    if (username === "test1" && password === "test1") {
        return Promise.resolve();
    }
    return Promise.reject();
}

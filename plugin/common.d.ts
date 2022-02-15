interface ISftpStartOptions extends IDebugSftpOptions {
    port?: number;
    hostKeys?: { keyPath: string; passphrase: string }[];
    serverLogDirPath?: string;
}

interface ISftpStopOptions extends IDebugSftpOptions {}

interface IDebugSftpOptions {
    debug: boolean;
}

interface ISftpStartResult extends ISftpResultBase {
    server: {
        host: string;
        port: number;
        family: string;
    };
}

interface ISftpStopResult extends ISftpResultBase {}

interface ISftpResultBase {
    status: boolean;
    error?: string;
}

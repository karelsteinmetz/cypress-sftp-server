import * as fs from "fs";
import * as path from "path";

export interface IServerLogger {
    log: (message: string, color?: string) => void;
}

export function createLogger(directoryPath: string): IServerLogger {
    const apiMockLogsFolderPath = path.resolve(directoryPath);
    const testTimestamp = new Date().toISOString().replace(/(:)|(\.)/g, "-");
    const guid = uuid();
    const apiMockLogsPath = path.resolve(`${apiMockLogsFolderPath}/${testTimestamp}-${guid}.log`);

    function writeFileLog(message: string): void {
        const timestamp = new Date().toISOString();
        if (!fs.existsSync(apiMockLogsFolderPath)) {
            fs.mkdirSync(apiMockLogsFolderPath);
        }
        fs.appendFileSync(apiMockLogsPath, `${timestamp}\t${message}\n`);
    }
    return {
        log: (message: string, color: string = "\x1b[0m") => {
            console.log("SFTP-Server", "\t", color, message, "\x1b[0m");
            writeFileLog(message);
        },
    };
}

function uuid(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0,
            v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

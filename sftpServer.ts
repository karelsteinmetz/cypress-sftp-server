import { sftpStart } from "./plugin/sftpServerCore";
import * as path from "path";

run(true)
    .catch((e) => {
        console.log("Error:", e);
    })
    .finally(() => {
        console.log("Process terminated");
    });

async function run(debug: boolean) {
    const startResult = await sftpStart({
        port: 22,
        hostKeys: [
            {
                keyPath: path.resolve(__dirname, "plugin/dist/privateKey.ppk"),
                passphrase: "test",
            },
        ],
        serverLogDirPath: "",
        debug,
    });

    console.log("startResult: ", startResult);

    //await sftpStop({ debug });
}

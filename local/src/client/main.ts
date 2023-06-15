import LogWatcher from "./logWatcher";
import CommandManager from "./commandManager";
import Server from "./server";
import { matchStatus, matchKill, matchChat, matchLobby } from "./regexes";
import { logPath, rconPort, rconPwd } from "..";

const server = new Server();

function handleConsoleLine(line: string) {
    if (!server) return;

    const statusMatch = matchStatus(line);
    if (statusMatch) {
        server.handleStatus(statusMatch);
        return;
    }

    const killMatch = matchKill(line);
    if (killMatch) {
        server.handleKill(killMatch);
        return;
    }

    const chatMatch = matchChat(line);
    if (chatMatch) {
        server.handleChat(chatMatch);
        return;
    }
}

function handleCommandResponse(line: string) {
    if (!server) return;

    const match = matchLobby(line);
    if (!match) return;

    server.handleLobby(match);
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
export async function runClient() {
    if (logPath === undefined) {
        throw new Error("Log file path not defined. (LOG_PATH env var)");
    }
    if (rconPwd === undefined) {
        throw new Error("Rcon Password not defined. (RCON_PWD env var)");
    }

    const watcher = new LogWatcher();
    watcher.setFilePath(logPath);
    watcher.setHandler(handleConsoleLine);

    const cmd = new CommandManager(rconPort, rconPwd);
    cmd.setHandler(handleCommandResponse);

    // eslint-disable-next-line no-constant-condition
    while(true) {
        await cmd.runStatus();
        await cmd.runLobby();

        await delay(10000);
    }
}

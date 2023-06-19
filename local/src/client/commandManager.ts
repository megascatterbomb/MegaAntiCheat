import Rcon, { RconConfig, State } from "rcon-ts";
import OS from "os";

export enum KickReason {
    None = "other",
    Idle = "idle",
    Cheating = "cheating",
    Scamming = "scamming",
}

export default class CommandManager {
    private options!: RconConfig;
    private rcon!: Rcon;
    private handler: ((response: string) => void) | undefined;

    constructor(port: number, password: string) {
        this.configureRcon(port, password);
    }

    /** Set the settings for an rcon connection and try connect */
    public async configureRcon(port: number, password: string) {
        this.options = {
            host: "127.0.0.1",
            port: port,
            password: password,
        };
        this.rcon = new Rcon(this.options);

        await this.forceConnect();
    }

    /** Force Rcon to try connect. Returns true if successful or false if not */
    public async forceConnect() {
        if (this.isConnected()) return;
        try {
            await this.rcon.connect();
            return true;
        } catch (error) {
            console.log("Rcon is not connected: " + error);
            return false;
        }
    }

    public isConnected() {
        return this.rcon.state === State.Connected;
    }

    /** Runs a command and handles the response */
    public async runCommand(command: string) {
        // Try reconnect if disconnected
        if (!(await this.forceConnect())) return;

        // Run command
        let response: string;
        try {
            response = await this.rcon.send(command);
        } catch (error) {
            console.log("Failed to send rcon command: " + error);
            return;
        }

        // Handle response
        if (!this.handler === undefined) {
            response.split(OS.EOL).forEach(this.handler as (line: string) => void);
        }
    }

    //** Runs the command to send a chat message containing the following text */
    public async sendChatMessage(message: string) {
        return this.runCommand('say "' + message + '"');
    }

    /** Run the command to kick the player with the provided uid and reason */
    public async kickPlayer(uid: string, reason: KickReason) {
        return this.runCommand('callvote kick "' + uid + " " + reason + '"');
    }

    /** Runs the status command */
    public async runStatus() {
        return this.runCommand("status");
    }

    /** Runs the tf_lobby_debug command */
    public async runLobby() {
        return this.runCommand("tf_lobby_debug");
    }

    /** The handler function is called on each line of a command's response */
    public setHandler(handler: ((response: string) => void) | undefined) {
        this.handler = handler;
    }
}

import CommandManager from "./commandManager";
import LogWatcher from "./logWatcher";
import Player from "./player";
import { ChatCapture, KillCapture, LobbyCapture, StatusCapture, matchChat, matchKill, matchLobby, matchStatus } from "./regexes";


export default class Server {
    private players: Map<string, Player>;
    private chat: ChatCapture[] = [];
    private kills: KillCapture[] = [];

    constructor() {
        this.players = new Map();
    }

    public getPlayers() {
        return this.players;
    }

    public getPlayer(steamid32: string): Player | undefined {
        return this.players.get(steamid32);
    }

    public setPlayer(steamid32: string, player: Player) {
        this.players.set(steamid32, player);
    }

    public getChat(): ChatCapture[] {
        return this.chat;
    }

    public getKills(): KillCapture[] {
        return this.kills;
    }

    public registerLogWatcher(logwatcher: LogWatcher) {
        logwatcher.setHandler(this.handleConsoleLine);
    }

    public registerCommandManager(commandManager: CommandManager) {
        commandManager.setHandler(this.handleCommandRespose);
    }

    private updatePlayerStatus(status: StatusCapture) {
        let player = this.players.get(status.steamid32);
        if (player === undefined) {
            player = new Player(status);
            this.players.set(status.steamid32, player);
        } else {
            player.update(status);
        }
    }

    private updatePlayerLobby(lobby: LobbyCapture) {
        let player = this.players.get(lobby.steamid32);
        if (player === undefined) return;
        player.updateLobby(lobby);
    }

    private handleConsoleLine(line: string) {
        let statusMatch = matchStatus(line);
        if (statusMatch !== null) {
            this.handleStatus(statusMatch);
            return;
        }

        let killMatch = matchKill(line);
        if (killMatch !== null) {
            this.handleKill(killMatch);
            return;
        }

        let chatMatch = matchChat(line);
        if (chatMatch !== null) {
            this.handleChat(chatMatch);
            return;
        }
    }

    private handleCommandRespose(line: string) {
        let match = matchLobby(line);
        if (match === null) return;

        this.updatePlayerLobby(match);
        console.log("Lobby: " + JSON.stringify(line));
    }

    private handleStatus(cap: StatusCapture) {
        this.updatePlayerStatus(cap);
        console.log("Status: " + JSON.stringify(cap));
    }

    private handleChat(cap: ChatCapture) {
        // Fetch steamid if player is present
        for (let p of this.players.values()) {
            if (p.name === cap.playerName) {
                cap.steamid32 = p.steamid32;
                break;
            }
        }

        this.chat.push(cap);
        console.log("Chat: " + JSON.stringify(cap));
    }

    private handleKill(cap: KillCapture) {
        // Fetch steamid if player is present
        for (let p of this.players.values()) {
            if (p.name === cap.victimName) {
                cap.victimSteamid = p.steamid32;
                break;
            }
        }
        for (let p of this.players.values()) {
            if (p.name === cap.killerName) {
                cap.killerSteamid = p.steamid32;
                break;
            }
        }

        this.kills.push(cap);
        console.log("Kill: " + JSON.stringify(cap));
    }
}


import verboseLog from "../common/logging";
import { SteamID } from "../common/steamID";
import Player from "./player";
import {
    ChatCapture,
    KillCapture,
    LobbyCapture,
    StatusCapture,
    matchChat,
    matchKill,
    matchLobby,
    matchStatus,
} from "./regexes";

export default class Server {
    private players: Map<SteamID, Player>;
    private chat: ChatCapture[] = [];
    private kills: KillCapture[] = [];

    constructor() {
        this.players = new Map();
    }

    public getPlayers() {
        return this.players;
    }

    public getPlayer(steamid: SteamID): Player | undefined {
        return this.players.get(steamid);
    }

    public setPlayer(steamid: SteamID, player: Player) {
        this.players.set(steamid, player);
    }

    public getChat(): ChatCapture[] {
        return this.chat;
    }

    public getKills(): KillCapture[] {
        return this.kills;
    }

    public handleLobby(lobby: LobbyCapture) {
        let player = this.players.get(lobby.steamid);
        if (player === undefined) return;
        player.updateLobby(lobby);
        verboseLog("Lobby: " + JSON.stringify(lobby));
    }

    public handleStatus(status: StatusCapture) {
        let player = this.players.get(status.steamid);
        if (player === undefined) {
            player = new Player(status);
            this.players.set(status.steamid, player);
        } else {
            player.update(status);
        }
        verboseLog("Status: " + JSON.stringify(status));
    }

    public handleChat(chat: ChatCapture) {
        // Fetch steamid if player is present
        for (let p of this.players.values()) {
            if (p.name === chat.playerName) {
                chat.steamid = p.steamid;
                break;
            }
        }

        this.chat.push(chat);
        verboseLog("Chat: " + JSON.stringify(chat));
    }

    public handleKill(kill: KillCapture) {
        // Fetch steamid if player is present
        for (let p of this.players.values()) {
            if (p.name === kill.victimName) {
                kill.victimSteamid = p.steamid;
                break;
            }
        }
        for (let p of this.players.values()) {
            if (p.name === kill.killerName) {
                kill.killerSteamid = p.steamid;
                break;
            }
        }

        this.kills.push(kill);
        verboseLog("Kill: " + JSON.stringify(kill));
    }
}

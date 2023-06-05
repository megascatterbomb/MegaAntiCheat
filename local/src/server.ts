import Player from "./player";
import { LobbyCapture, StatusCapture } from "./regexes";


export default class Server {
    private players: Map<string, Player>;

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

    public updatePlayerStatus(status: StatusCapture) {
        let player = this.players.get(status.steamid32);
        if (player === undefined) {
            player = new Player(status);
            this.players.set(status.steamid32, player);
        } else {
            player.update(status);
        }
    }

    public updatePlayerLobby(lobby: LobbyCapture) {
        let player = this.players.get(lobby.steamid32);
        if (player === undefined) return;
        player.updateLobby(lobby);
    }
}
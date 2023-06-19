import { SteamID } from "../common/steamID";
import { LobbyCapture, StatusCapture } from "./regexes";

export enum Team {
    Defenders,
    Invaders,
    None,
}

export enum PlayerState {
    Spawning,
    Active,
}

export default class Player {
    uid: string;
    name: string;
    steamid: SteamID;
    time: string = "";
    ping: number;
    loss: number;
    team: Team = Team.None;
    state: PlayerState = PlayerState.Spawning;

    constructor(player: StatusCapture) {
        this.uid = player.userid;
        this.name = player.name;
        this.steamid = player.steamid; 
        this.time = player.time;
        this.ping = player.ping;
        this.loss = player.loss;
        this.state = player.state;
    }

    public update(player: StatusCapture) {
        if (player.steamid !== this.steamid) {
            throw new Error("Wrong status entry for player");
        }
        this.uid = player.userid;
        this.name = player.name;
        this.time = player.time;
        this.ping = player.ping;
        this.loss = player.loss;
        this.state = player.state;
    }

    public updateLobby(player: LobbyCapture) {
        if (player.steamid !== this.steamid) {
            throw new Error("Wrong status entry for player");
        }
        this.team = player.team;
    }
}

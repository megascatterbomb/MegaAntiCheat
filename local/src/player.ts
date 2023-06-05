
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
    private uid: string;
    private name: string;
    private steamid32: string;
    private steamid64: string;
    private time: string = "";
    private team: Team = Team.None;
    private state: PlayerState = PlayerState.Spawning;

    constructor(uid: string, name: string, steamid32: string) {
        this.uid = uid;
        this.name = name;
        this.steamid32 = steamid32;
        this.steamid64 = String(steamid32To64(steamid32));
    }

    public getUid() {
        return this.uid;
    }
    public getName() {
        return this.name;
    }
    public getSteamid32() {
        return this.steamid32;
    }
    public getSteamid64() {
        return this.steamid64;
    }
    public getTime() {
        return this.time;
    }
    public getTeam() {
        return this.team;
    }
    public getState() {
        return this.state;
    }
}

export function steamid32To64(steamid32: string): string | null {
    let segments = steamid32.split(":");
    if (segments.length != 3) return null;

    let id32 = BigInt(segments[2]);
    return String(id32 + BigInt("76561197960265728"));
}

export function steamid64To32(steamid64: string): string {
    let id64 = BigInt(steamid64);
    return "U:1:" + (id64 - BigInt("76561197960265728"));
}
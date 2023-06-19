export const steamID1Regex = /^STEAM_[0-5]:[01]:\d+$/;
export const steamID1RegexGlobal = /STEAM_[0-5]:[01]:\d+/g;
export const steamID3Regex = /^\[[IUMGAPCgTLCa]:1:\d+]$/;
export const steamID3RegexGlobal = /\[[IUMGAPCgTLCa]:1:\d+]/g;
export const steamID64Regex = /^\d{17}$/;
export const steamID64RegexGlobal = /\d{17}/g;
export const steamCustomURLRegex = /^(?:https?:\/\/)?steamcommunity\.com\/id\/[a-zA-Z0-9_\\-]+\/?$/;
export const steamCustomURLRegexGlobal =
    /(?:https?:\/\/)?steamcommunity\.com\/id\/[a-zA-Z0-9_\\-]+\/?/g;
export const steamFixedURLRegex = /^(?:https?:\/\/)?steamcommunity\.com\/profiles\/[0-9]{17}\/?$/;
export const steamFixedURLRegexGlobal =
    /(?:https?:\/\/)?steamcommunity\.com\/profiles\/[0-9]{17}\/?/g;

export class SteamID {
    steamID64: string;
    steamID3: string;
    steamID1: string;
    constructor(input: string) {
        // Need to determine if the input is a form of SteamID.
        if (input.match(steamID1Regex)) {
            this.steamID64 = convertSteamID1toSteamID64(input);
            this.steamID3 = convertSteamID64toSteamID3(this.steamID64);
            this.steamID1 = convertSteamID64toSteamID1(this.steamID64);
            return;
        } else if (input.match(steamID3Regex)) {
            this.steamID64 = convertSteamID3toSteamID64(input);
            this.steamID3 = convertSteamID64toSteamID3(this.steamID64);
            this.steamID1 = convertSteamID64toSteamID1(this.steamID64);
            return;
        } else if (input.match(steamID64Regex) && BigInt(input) >= steamID64Base) {
            this.steamID64 = input;
            this.steamID3 = convertSteamID64toSteamID3(this.steamID64);
            this.steamID1 = convertSteamID64toSteamID1(this.steamID64);
            return;
        }
        // If we get here, we're dealing with a custom URL.
        // If custom url is invalid, throw error. Want to guarantee SteamID objects are defined.
        throw new Error("Invalid SteamID");
    }
}

// Guide to converting SteamIDs between the formats available here:
// https://developer.valvesoftware.com/wiki/SteamID
// only U matters, but rest are included just in case.

const steamID3LetterTable = new Map<bigint, string>([
    [0n, "I"],
    [1n, "U"],
    [2n, "M"],
    [3n, "G"],
    [4n, "A"],
    [5n, "P"],
    [6n, "C"],
    [7n, "g"],
    [8n, "T"],
    [10n, "a"],
]);
const steamID64Base = 0x0110000100000000n;

// Converts STEAM_0:0:1 type to 76561197960265728 type
export function convertSteamID1toSteamID64(steamID: string): string {
    // eslint-disable-next-line prefer-const
    let [strX, strY, strZ]: string[] = steamID.split(":");
    strX = strX.substring(6); // Remove STEAM_ from X
    const [x, y, z]: bigint[] = [BigInt(strX), BigInt(strY), BigInt(strZ)];
    return (z + z + y + steamID64Base).toString();
}
// Converts [U:1:1234] type to 76561197960265728 type
export function convertSteamID3toSteamID64(steamID: string): string {
    // eslint-disable-next-line prefer-const
    let [, strY, strZ]: string[] = steamID.split(":");
    strZ = strZ.substring(0, strZ.length - 1); // Remove brackets from Z
    const [y, z]: bigint[] = [BigInt(strY), BigInt(strZ)];
    return (z + steamID64Base).toString();
}
// Converts 76561197960265728 type to [U:1:1234] type
export function convertSteamID64toSteamID3(steamID64: string) {
    const original = BigInt(steamID64);
    //const universe = original >> 56n;
    const type = (original >> 52n) % 16n;
    const y = original % 2n;
    const accountNumber = original % 4294967296n >> 1n; // Get account number
    const output =
        "[" + steamID3LetterTable.get(type) + ":1:" + (accountNumber * 2n + y).toString() + "]";
    return output;
}
// Converts 76561197960265728 type to STEAM_0:0:1 type
export function convertSteamID64toSteamID1(steamID64: string) {
    const original = BigInt(steamID64);
    const universe = original >> 56n;
    //const type = (original >> 52n) % 16n;
    const y = original % 2n;
    const accountNumber = original % 4294967296n >> 1n; // Get account number
    const output = "STEAM_" + universe + ":" + y + ":" + accountNumber;
    return output;
}

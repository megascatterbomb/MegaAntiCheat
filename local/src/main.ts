#!/usr/bin/env node
import yargs from 'yargs';
import LogWatcher from './logWatcher';
import CommandManager, { KickReason } from "./commandManager";
import Server from './server';

const argv = yargs(process.argv.slice(2)).options({
    noLocalDB: { type: 'boolean', default: false }, // Don't start a local database
    remote:     { type: 'string' }, // Remote database to connect to
    
    headless:   { type: 'boolean', default: false }, // Don't run the companion client, just start and host a local database
    dbPort:    { type: 'number',  default: 8009 }, // Port to host local database on (subject to change)
    webPort:   { type: 'number',  default: 8008 }, // Port to host the web server on (subject to change)

    rconPort:  { type: 'number',  default: 27015 }, // Rcon port for TF2
    rconPwd:   { type: 'string',  default: "tf2bk" }, // Rcon password (set in TF2's autoexec.cfg file) (subject to change, just set to this for testing)
}).parseSync();




async function main() {

    let watcher = new LogWatcher();
    watcher.setFilePath("/home/ethan/.steam/steam/steamapps/common/Team Fortress 2/tf/console.log");

    let cmd = new CommandManager(argv.rconPort, argv.rconPwd);

    let server = new Server();
    server.registerLogWatcher(watcher);
    server.registerCommandManager(cmd);

    await cmd.runLobby();
}

main();
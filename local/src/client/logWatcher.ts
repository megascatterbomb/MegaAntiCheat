import * as fs from "fs";
import OS from "os";

export default class LogWatcher {
    private logFilePath: string;
    private logFileDescriptor: number | null = null;
    private logFileWatcher: fs.StatWatcher | null = null;
    private newLineHandler: ((line: string) => void) | null = null;

    constructor() {
        this.logFilePath = "";
    }

    /** The handler function is called with each new line appended to the log file */
    public setHandler(new_line_handler: ((line: string) => void) | null) {
        this.newLineHandler = new_line_handler;
    }

    /** Register the log file that TF2 will print to while running */
    public setFilePath(log_file_path: string) {
        // Stop watching any previous files
        if (this.logFileWatcher != undefined) {
            fs.unwatchFile(this.logFilePath);
        }

        // Update file stuff
        this.logFilePath = log_file_path;
        if (!fs.existsSync(this.logFilePath)) {
            this.logFileDescriptor = null;
            return;
        }
        this.logFileDescriptor = fs.openSync(this.logFilePath, "r");

        // Watch file
        this.logFileWatcher = fs.watchFile(this.logFilePath, { interval: 100 }, (curr, prev) => {
            if (this.logFileDescriptor == null) return;

            if (curr.mtime < prev.mtime) return; // File wasn't modified

            let start = prev.size;
            let sizeDiff = curr.size - prev.size;
            if (sizeDiff < 0) {
                fs.close(this.logFileDescriptor);
                this.logFileDescriptor = fs.openSync(this.logFilePath, "r");
                sizeDiff = curr.size;
                start = 0;
            }

            const buffer = Buffer.alloc(sizeDiff);
            const read = fs.readSync(this.logFileDescriptor, buffer, 0, sizeDiff, start);

            if (this.newLineHandler != null) {
                buffer.toString().split(OS.EOL).forEach(this.newLineHandler);
            }
        });
    }

    /** Returns true if the set log file could be opened and read */
    public watchingValidFile() {
        return this.logFileDescriptor != null;
    }
}
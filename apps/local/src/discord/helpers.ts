import { Attachment, Message } from "discord.js";
import * as fs from "fs";
import https from "https";

// Downloads text attachments from a discord message and returns each file as a string.
export async function downloadTextAttachments(attachments: Attachment[]): Promise<string[]> {
    const textAttachments = attachments.filter(a => (a?.contentType?.search("text\\/plain") ?? -1) > -1);
    // Download all text attachments
    await Promise.all(textAttachments.map(async (a) => {
        return new Promise<void>((resolve) => {
            const file = fs.createWriteStream("./temp/" + a.id + ".txt");
            const request = https.get(a.url, (response) => {
                response.pipe(file);
                file.on("finish", () => {
                    file.close();
                    resolve();
                });
            });
        });
    }));

    const totalStringArray: string[] = [];
    const fileNames: string[] = []; 
    textAttachments.forEach((_, key) => {
        const fileName = "./temp/" + key + ".txt";
        const content = fs.readFileSync(fileName).toString();
        totalStringArray.push(content);
        fileNames.push(fileName);
    });
    const cleanup = async () => {
        fileNames.forEach(f => fs.unlinkSync(f));
    };
    cleanup();
    return totalStringArray;
}
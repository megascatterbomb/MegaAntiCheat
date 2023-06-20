import dotenv from 'dotenv';

dotenv.config({ path: './local/.env' });

export let verboseEnabled = process.env.VERBOSE === 'true';

export function setVerbose(verbose: boolean) {
    verboseEnabled = verbose;
}

export default function verboseLog(content: string) {
    if (!verboseEnabled) return;
    console.log(content);
}

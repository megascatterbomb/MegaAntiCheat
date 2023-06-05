export let verboseEnabled = false; 

export function setVerbose(verbose: boolean) {
    verboseEnabled = verbose;
}

export default function log(content: string, verbose = false) {
    if(verbose && !verboseEnabled) return;
    console.log();
}
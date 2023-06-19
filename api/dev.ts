import esbuild, { Plugin } from "esbuild";
import { glob } from "glob";
import { spawn, ChildProcess } from "child_process";

export const plugin: Plugin = {
    name: "dev-plugin",

    setup(build) {
        let proc: ChildProcess;

        build.onEnd(async () => {
            console.log("Build finished, restarting server...");

            if (proc) proc.kill();

            proc = spawn("node", ["build/index.js"], {
                stdio: "inherit",
            });
        });
    },
};

export const main = async () => {
    const files = await glob("src/**/*.ts");

    const ctx = await esbuild.context({
        plugins: [plugin],

        bundle: true,
        platform: "node",
        target: "es2021",
        outdir: "build",
        entryPoints: files,
    });

    await ctx.watch();
};

main();

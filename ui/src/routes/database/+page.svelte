<script lang="ts">
    import type { IPlayer } from "$lib";
    import { onMount } from "svelte";
    import type { PageData } from "./$types";

    export let data: PageData;

    const players: IPlayer[] = data.players;
    
    $: checked = { _: false } as Record<string, boolean>;
    $: allChecked = Object.values(checked).every((value) => value === true);

    onMount(() => {
        for (const player of players) {
            checked[player._id] = false;
        }

        delete checked._;
    });

    const toggleAll = () => {
        if (allChecked) {
            for (const key in checked) {
                checked[key] = false;
            }
        } else {
            for (const key in checked) {
                checked[key] = true;
            }
        }
    };
</script>

<div class="overflow-x-auto">
    <table class="table">
        <thead>
            <tr>
                <th>
                    <label>
                        <input
                            type="checkbox"
                            class="checkbox"
                            on:change|preventDefault={toggleAll}
                            bind:checked={allChecked}
                        />
                    </label>
                </th>

                <th>ID</th>
                <th>Steam ID</th>
                <th>Name</th>
                <th>Status</th>
                <th>Aliases</th>
            </tr>
        </thead>

        <tbody>
            {#each players as player}
                <tr
                    class="transition-all cursor-pointer hover"
                >
                    <th>
                        <label>
                            <input
                                type="checkbox"
                                class="checkbox"
                                bind:checked={checked[player._id]}
                            />
                        </label>
                    </th>

                    <th>{player._id}</th>
                    <th>{player.steamId}</th>
                    <th>{player.name}</th>
                    <th>{player.status}</th>
                    <th>{player.aliases.join(", ")}</th>
                </tr>
            {/each}
        </tbody>
    </table>
</div>

<script lang="ts">
    import type { IPlayer, PlayerStatus } from "$lib";
    import { onMount } from "svelte";
    import type { PageData } from "./$types";
    import { Icon } from "@steeze-ui/svelte-icon";
    import { Pencil, XMark } from "@steeze-ui/heroicons";

    export let data: PageData;

    const players: IPlayer[] = data.players;

    $: checked = { _: false } as Record<string, boolean>;
    $: allChecked = Object.values(checked).every((value) => value === true);
    $: values = {} as Record<string, PlayerStatus>;
    $: editing = {} as Record<string, boolean>;

    onMount(() => {
        for (const player of players) {
            checked[player._id] = false;
            values[player._id] = player.status;
            editing[player._id] = false;
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

    const getOptions = (status: string) => {
        const values = [
            {
                label: "Normal",
                value: "Normal",
                selected: false,
            },

            {
                label: "Suspicious",
                value: "Suspicious",
                selected: false,
            },

            {
                label: "Cheater",
                value: "Cheater",
                selected: false,
            },

            {
                label: "Bot",
                value: "Bot",
                selected: false,
            },
        ];

        for (let i = 0; i < values.length; i++) {
            if (values[i].value === status) {
                values[i].selected = true;
            }
        }

        return values;
    };

    const buildUpdater = (player: IPlayer) => {
        return async (event: Event) => {
            const target = event.target as HTMLSelectElement;
            const value = target.value;

            const data = await (
                await fetch(`/api/players/${player._id}`, {
                    method: "PATCH",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        status: value,
                    }),
                })
            ).json();

            values[player._id] = value as PlayerStatus;
            editing[player._id] = false;

            return data;
        };
    };
</script>

<svelte:head>
    <title>MegaAntiCheat | Database</title>
</svelte:head>

<div class="overflow-x-auto">
    <table class="table">
        <thead>
            <tr>
                <th class="w-2">
                    <label>
                        <input
                            type="checkbox"
                            class="checkbox"
                            on:change|preventDefault={toggleAll}
                            bind:checked={allChecked}
                        />
                    </label>
                </th>

                <th class="w-2" />

                <th>ID</th>
                <th>Steam ID</th>
                <th>Name</th>
                <th>Status</th>
                <th>Aliases</th>
            </tr>
        </thead>

        <tbody>
            {#each players as player}
                <tr class="transition-all cursor-pointer hover">
                    <th>
                        <label>
                            <input
                                type="checkbox"
                                class="checkbox"
                                bind:checked={checked[player._id]}
                            />
                        </label>
                    </th>

                    <th>
                        <button
                            class="btn btn-sm btn-square hover:bg-slate-700"
                            on:click={() => (editing[player._id] = !editing[player._id])}
                        >
                            {#if editing[player._id]}
                                <Icon src={XMark} size="18px" theme="solid" />
                            {:else}
                                <Icon src={Pencil} size="18px" theme="solid" />
                            {/if}
                        </button>
                    </th>

                    <th>{player._id}</th>
                    <th>{player.steamId}</th>
                    <th>{player.name}</th>

                    <th>
                        {#if editing[player._id]}
                            <select
                                class="w-full max-w-xs select select-ghost select-sm"
                                on:change|preventDefault={buildUpdater(player)}
                                bind:value={values[player._id]}
                            >
                                {#each getOptions(player.status) as item}
                                    <option value={item.value} selected={item.selected}
                                        >{item.label}</option
                                    >
                                {/each}
                            </select>
                        {:else}
                            {values[player._id]}
                        {/if}
                    </th>

                    <th>{player.aliases.join(", ")}</th>
                </tr>
            {/each}
        </tbody>
    </table>
</div>

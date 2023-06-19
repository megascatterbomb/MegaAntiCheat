<script lang="ts">
    import type { IPlayer, PlayerStatus } from "$lib";
    import { onMount } from "svelte";
    import type { PageData } from "./$types";
    import { Icon } from "@steeze-ui/svelte-icon";
    import { ChevronLeft, ChevronRight, Pencil, XMark } from "@steeze-ui/heroicons";
    import { browser } from "$app/environment";

    export let data: PageData;

    // This line is an abomination but I love it.
    $: players = data.data.data as IPlayer[];
    $: pages = data.data.pagination.pages;
    $: page = data.data.pagination.page;
    $: shown = [] as number[];
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

    /**
     * This is INCREDIBLY hacky!
     * I'm sorry for this, but I don't know how to do it better.
     * I can see like 900 billion bugs with this when tested, but
     * I don't know how to fix it. Sorry.
     */
    const fixShown = () => {
        shown = [];

        if (page > 2) {
            shown.push(page - 1);
        }

        if (page > 1) {
            shown.push(page);
        }

        shown.push(page + 1);

        if (page + 1 < pages) {
            shown.push(page + 2);
        }

        if (page + 2 < pages) {
            shown.push(page + 3);
        }

        if (shown.length == 3 && page + 3 < pages) {
            shown.push(page + 4);
        }

        // Why
        if (shown.length == 4 && page + 4 > 0) {
            shown.push(page + 5);
        }

        shown = [...shown];
    };

    const nextPage = async () => {
        if (page > pages) return;

        const data = await (
            await fetch(`/api/players?page=${page + 1}`, {
                method: "GET",
            })
        ).json();

        players = data.data as IPlayer[];
        pages = data.pagination.pages;
        page = data.pagination.page;

        fixShown();

        return data;
    };

    const prevPage = async () => {
        if (page < 0) return;

        const data = await (
            await fetch(`/api/players?page=${page - 1}`, {
                method: "GET",
            })
        ).json();

        players = data.data as IPlayer[];
        pages = data.pagination.pages;
        page = data.pagination.page;

        fixShown();

        return data;
    };

    const goToPage = async (pageN: number) => {
        const data = await (
            await fetch(`/api/players?page=${pageN - 1}`, {
                method: "GET",
            })
        ).json();

        players = data.data as IPlayer[];
        pages = data.pagination.pages;
        page = data.pagination.page;

        fixShown();

        return data;
    };

    onMount(() => {
        fixShown();
    });
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

            <!-- This fixes the issues with position:fixed; it adds space at the bottom -->
            <br />
            <br />
            <br />
        </tbody>
    </table>

    <div class="flex fixed bottom-4 justify-center w-full">
        <div class="join">
            <button class="join-item btn btn-sm" on:click={prevPage}>
                <Icon src={ChevronLeft} size="18px" theme="solid" />
            </button>

            {#each shown as pageNum}
                <button
                    class="join-item btn btn-sm"
                    class:btn-primary={pageNum - 1 === page}
                    on:click={() => goToPage(pageNum)}
                >
                    {pageNum}
                </button>
            {/each}

            <button class="join-item btn btn-sm" on:click={nextPage}>
                <Icon src={ChevronRight} size="18px" theme="solid" />
            </button>
        </div>
    </div>
</div>

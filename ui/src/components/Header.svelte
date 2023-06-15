<script lang="ts">
    import { Icon } from "@steeze-ui/svelte-icon";
    import { Home, Users } from "@steeze-ui/heroicons";
</script>

<div class="drawer">
    <input id="sidebar" type="checkbox" class="drawer-toggle" />

    <div class="drawer-content">
        <div class="navbar bg-base-200">
            <div class="flex-none">
                <label for="sidebar" class="btn btn-square btn-ghost drawer-button">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        ><path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4 6h16M4 12h16M4 18h7"
                        /></svg
                    >
                </label>
            </div>

            <div class="navbar-start">
                <a class="text-xl normal-case btn btn-ghost" href="/">MegaAntiCheat</a>
            </div>

            <div class="navbar-end">
                <button class="btn btn-ghost btn-circle">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        ><path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        /></svg
                    >
                </button>

                <button class="btn btn-ghost btn-circle">
                    <div class="indicator">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            ><path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                            /></svg
                        >
                        <span class="badge badge-xs badge-primary indicator-item" />
                    </div>
                </button>
            </div>
        </div>

        <slot />
    </div>

    <div class="drawer-side">
        <label for="sidebar" class="drawer-overlay" />

        <ul class="p-4 w-80 h-full menu bg-base-200 text-base-content">
            <li class="mb-3 rounded-md bg-neutral">
                <a href="/">
                    <Icon src={Home} size="18px" theme="solid" />
                    Home
                </a>
            </li>

            <li class="mb-3 rounded-md bg-neutral">
                <a href="/database">
                    <Icon src={Users} size="18px" theme="solid" />
                    Database
                </a>
            </li>
        </ul>
    </div>
</div>

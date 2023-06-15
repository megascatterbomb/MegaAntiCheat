<script lang="ts">
    import type { PageData } from "./$types";

    export let data: PageData;
</script>

<div class="flex flex-col justify-center items-center h-full">
    <div class="flex flex-col justify-center items-center">
        <h1 class="text-5xl font-bold text-center">404</h1>

        <p class="text-xl text-center">Page not found</p>
    </div>

    <div class="flex flex-col justify-center items-center mt-8">
        <p class="text-xl text-center">"{data.quote.quote}"</p>

        <p class="text-xl text-center">- {data.quote.author}</p>
    </div>
</div>

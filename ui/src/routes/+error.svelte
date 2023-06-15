<script lang="ts">
    import { onMount } from "svelte";

    interface Quote {
        quote: string;
        author: string;
    }

    const quotes: Quote[] = [
        {
            quote: "Say goodbye to your kneecaps, chucklehead!",
            author: "Scout",
        },

        {
            quote: "They're going to have to glue you back together, in hell!",
            author: "Demoman",
        },

        {
            quote: "I'm drunk, you don't have an excuse!",
            author: "Demoman",
        },

        {
            quote: "I'm battin' a thousand!",
            author: "Scout",
        },

        {
            quote: "You're like a car crash in slow motion, it's like I'm watchin' ya fly through a windshield!",
            author: "Scout",
        },

        {
            quote: "I'm gonna headbutt ya, I'm gonna headbutt ya, I'm gonna headbutt ya!",
            author: "Scout",
        },

        {
            quote: "I'm gonna put one right between your eyes, you punter!",
            author: "Sniper",
        },

        {
            quote: "I'm gonna blow the insides of your head all over four counties!",
            author: "Sniper",
        },

        {
            quote: "I'm gonna turn you into colored rain!",
            author: "Sniper",
        },

        {
            quote: "mmmph mmmph!",
            author: "Pyro",
        },

        {
            quote: "I'm gonna stick me thumbs in your eyes and hang on 'till you're dead!",
            author: "Demoman",
        },

        {
            quote: "You've got blood on my suit.",
            author: "Spy",
        },

        {
            quote: "I never really was on your side.",
            author: "Spy",
        },

        {
            quote: "I'm going to strangle you with your own frilly training bra!",
            author: "Soldier",
        },
    ];

    let quote: Quote | undefined = undefined;

    onMount(() => {
        quote = quotes[Math.floor(Math.random() * quotes.length)];
    });
</script>

<div class="flex flex-col justify-center items-center h-full">
    <div class="flex flex-col justify-center items-center">
        <h1 class="text-5xl font-bold text-center">404</h1>

        <p class="text-xl text-center">Page not found</p>
    </div>

    {#if quote}
        <div class="flex flex-col justify-center items-center mt-8">
            <p class="text-xl text-center">"{quote.quote}"</p>
        
            <p class="text-xl text-center">- {quote.author}</p>
        </div>
    {/if}
</div>

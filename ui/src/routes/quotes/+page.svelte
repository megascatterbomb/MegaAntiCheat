<script lang="ts">
    interface Quote {
        quote: string;
        author: string;
    }

    $: quotes = [] as Quote[];
    
    $: currentQuote = "";
    $: currentAuthor = "";

    const addQuote = () => {
        quotes = [...quotes, { quote: currentQuote, author: currentAuthor }];
        
        currentQuote = "";
        currentAuthor = "";
    };

    const exportQuotes = () => {
        const json = JSON.stringify(quotes, null, 4);

        navigator.clipboard.writeText(json);
    };
</script>

<div class="flex flex-col justify-center items-center h-full">
    <div class="flex flex-col justify-center items-center">
        <h1 class="text-4xl font-bold text-center">Quotes</h1>
        <p class="text-center">Add some quotes!</p>
    </div>

    <form class="flex flex-col justify-center items-center mt-8" action="#" on:submit|preventDefault={addQuote}>
        <div class="flex flex-col justify-center items-center">
            <input
                class="p-1 mb-4 w-full max-w-xs input-info input-md input-bordered input"
                type="text"
                placeholder="Quote"
                bind:value={currentQuote}
            />

            <input
                class="p-1 mb-4 w-full max-w-xs input-info input-md input-bordered input"
                type="text"
                placeholder="Author"
                bind:value={currentAuthor}
            />
        </div>

        <div class="flex flex-col justify-center items-center mt-4">
            <button
                class="px-4 py-2 font-bold text-white bg-blue-500 rounded outline-none hover:bg-blue-700"
                type="submit"
            >
                Add quote
            </button>

            <button
                class="px-4 py-2 mt-4 font-bold text-white bg-blue-500 rounded outline-none hover:bg-blue-700"
                on:click={exportQuotes}
                type="button"
            >
                Export quotes
            </button>
        </div>
    </form>

    <div class="flex flex-col justify-center items-center mt-8">
        {#each quotes as quote}
            <div class="flex flex-col justify-center items-center p-4 mb-2 max-w-lg rounded-md bg-base-200">
                <p class="text-center">"{quote.quote}"</p>
                <p class="text-center">- {quote.author}</p>
            </div>
        {/each}
    </div>
</div>

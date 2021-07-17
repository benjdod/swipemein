<script>
    import Requestlisting from "../../components/requestlisting.svelte";
    import "../../util/listtime"

    import { link } from "svelte-routing"

    let listings = []  

    fetch('/api/data/requests')
        .then(r => r.json())
        .then(r => {
            listings = r;
        })
        .catch(e => {
            console.error(e);
        })

</script>

<main>
    <div id="listings">
        {#if listings.length > 0}
        {#each listings as listing}
            <Requestlisting {...listing}></Requestlisting>
        {/each}
        {:else}
            <p>Looks like there are no requests right now!</p>
            <a use:link href="/">Go home</a>
        {/if}
    </div>
</main>

<style>


</style>
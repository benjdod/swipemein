<script>
    import Requestlisting from "../../components/requestlisting.svelte";
    import "../../util/listtime"


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
            <p>Looks like there are no listings right now!</p>
        {/if}
    </div>
</main>

<style>


</style>
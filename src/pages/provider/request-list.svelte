<!--
    This page displays all active requests to a provider
    and offers the ability for them to offer a swipe to one
-->

<script>
    import Requestlisting from "../../components/requestlisting.svelte";
    import "../../util/listtime"

	import { onMount } from 'svelte'

    import { link, navigate } from "svelte-routing"

	import { getCookies } from "../../util/doc-cookies"

	onMount(() => {
		if (! (getCookies()['smi-provider'])) {
			navigate('/new-provider', {replace: true});
		}

	})


    let listings = []  

	const fetchListings = () => {
		fetch('/api/data/requests')
			.then(r => r.json())
			.then(r => {
				listings = r;
			})
			.catch(e => {
				console.error(e);
			})
	}

	fetchListings();


</script>

<main>
    <div id="listings">
        {#if listings.length > 0}
        {#each listings as listing}
            <Requestlisting {...listing}></Requestlisting>
        {/each}
        {:else}
            <p>Looks like there are no requests right now!</p>
			<button on:click={fetchListings}>Refresh</button><br>
            <a use:link href="/">Go home</a>
        {/if}
    </div>
</main>

<style>


</style>

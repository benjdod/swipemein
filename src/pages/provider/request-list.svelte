<!--
    This page displays all active requests to a provider
    and offers the ability for them to offer a swipe to one
-->

<script>
    import Requestlisting from "../../components/request/listing.svelte";
    import "../../util/listtime"

	import { onMount } from 'svelte'

    import { link, navigate } from "svelte-routing"

	import { getCookies } from "../../util/doc-cookies"

	onMount(() => {
		if (! (getCookies()['smi-token'])) {
			navigate('/new-provider', {replace: true});
		}

		if (getCookies()['smi-participant-id']) {
			navigate('/chat', {replace: true});
		}

	})


    let listings = []  

	let errorMessage = 'Looks like there are no requests right now!';

	const fetchListings = () => {
		fetch('/api/data/requests')
			.then(r => r.json())
			.then(r => {
				listings = r;
			})
			.catch(e => {
				console.error(e);
				errorMessage = 'Could not load requests'
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
            <p>{errorMessage}</p>
			<button on:click={fetchListings}>Refresh</button><br>
            <a use:link href="/">Go home</a>
        {/if}
    </div>
</main>

<style>


</style>

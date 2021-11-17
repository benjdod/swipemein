<script>

	import {Router, Route} from "svelte-routing"

	import { getCookies } from "./util/doc-cookies";

	import SplashScreen from "./pages/splash.svelte"
	import ProviderReqList from "./pages/provider/request-list.svelte"
	import RequesterForm from "./pages/requester/request-form.svelte"
	import ProviderForm from "./pages/provider/provider-form.svelte"
	import RequestDisplay from "./pages/requester/request-display.svelte"
	import Completed from "./pages/completed.svelte"
	import Chat from "./pages/chat.svelte"
	import ProviderChat from "./pages/provider/provider-chat.svelte"
	import RequestChat from "./pages/requester/request-chat.svelte"
	import NotFound from "./pages/notfound.svelte"
	export let url = '';

	const role = getCookies()['smi-provider'] != undefined ? 'provider' : 'requester';

</script>

<main>
	<Router url="{url}">
		<Route path="/requests"><ProviderReqList/></Route>
		<Route path="/new-request"><RequesterForm/></Route>
		<Route path="/my-request"><RequestDisplay/></Route>
		<Route path="/new-provider"><ProviderForm/></Route>
		{#if role == 'provider'}
			<Route path="/chat"><ProviderChat/></Route>
		{:else}
			<Route path="/chat"><RequestChat/></Route>
		{/if}
		<Route path="/"><SplashScreen/></Route>
		<Route path="*"><NotFound/></Route>
	</Router>
</main>

<style>
	:global(.card) {
		border: 2px solid #ddd;
		box-shadow: 0px 0px 5px #ccc;
		border-radius: 10px;
		padding: 30px;
	}
</style>

<script>

	import {Router, Route} from "svelte-routing"

	import SplashScreen from "./pages/splash.svelte"
	import ProviderReqList from "./pages/provider/request-list.svelte"
	import RequesterForm from "./pages/requester/request-form.svelte"
	import ProviderForm from "./pages/provider/provider-form.svelte"
	import RequestDisplay from "./pages/requester/request-display.svelte"
	import Completed from "./pages/completed.svelte"
	import Chat from "./pages/chat.svelte"
	import NotFound from "./pages/notfound.svelte"
	export let url = '';
</script>

<main>
	<Router url="{url}">
		<Route path="/requests"><ProviderReqList/></Route>
		<Route path="/new-request"><RequesterForm/></Route>
		<Route path="/active-request"><RequestDisplay/></Route>
		<Route path="/new-provider"><ProviderForm/></Route>
		<Route path="/chat"><Chat/></Route>
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

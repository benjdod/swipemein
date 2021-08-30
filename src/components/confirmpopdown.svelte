<script>

    import RoundedButton from "./ui/roundedbutton.svelte";

    export let denyaction = () => {};
    export let confirmaction = () => {};
    export let deny = "cancel";
    export let confirm = "confirm";
    export let id = '';
</script>

<main>
    <div class="dialogbox" id={id}>
        <p><slot/></p>
        <button class="deny" on:click={denyaction}>{deny}</button>
        <button class="confirm" on:click={confirmaction}>{confirm}</button>
    </div>
</main>

<style>

</style>
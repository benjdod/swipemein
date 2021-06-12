<!--
    This form is presented to any prospective provider 
    to get their name in case it can't be recovered from local storage
-->

<script>

import { link } from "svelte-routing"

let name="";
</script>

<main>
    <h2>What's your name?</h2>
    <input type="text" bind:value={name}>
    <button>Submit</button>
    <br>
    <a use:link href="/">&LeftArrow; Back home</a>
</main>

<style>

</style>
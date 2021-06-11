<script>

    import { navigate } from "svelte-routing";

    export let backgroundColor;
    export let color;

    export let nav_to;

    const onClick = () => {
        if (nav_to != null) {
            navigate(nav_to);
        }
    }

</script>

<button style="background-color: {backgroundColor}; color: {color}" on:click={onClick}>
    <slot></slot>
</button>

<style>
    button {
        border-radius: 5px;
        border: none;
        margin: 15px;
        font-size: 24px;
        font-weight: 600;
        padding: 10px 15px;
    }
</style>
<!-- presents a yes/no dialog to the user -->

<script>
    import ModalBase from './base.svelte';

    export let confirm = 'confirm'
    export let deny = 'deny'
    export let confirmaction = undefined;
    export let denyaction = undefined;
</script>
<div>
<ModalBase confirm={confirm} deny={deny} confirmaction={confirmaction} denyaction={denyaction}>
    <slot/>
</ModalBase>
</div>
<style>

</style>
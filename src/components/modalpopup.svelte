<script>

    export let confirm = 'confirm'
    export let deny = 'deny'
    export let confirmaction = undefined;
    export let denyaction = undefined;

    // one of 'bottom' | 'top'
    export let position = 'bottom';

</script>

<main>
    <div class="modal-outer">
        <div class="modal-box {position}">
            <slot/>
            {#if confirmaction != undefined || denyaction != undefined}
            <br>
            <div class="choices">
                {#if confirmaction != undefined}
                <button class="halfwidth" on:click={denyaction}>{deny}</button>
                {/if}
                {#if denyaction != undefined}
                <button class="halfwidth" on:click={confirmaction}>{confirm}</button>
                {/if}
            </div>
            {/if}
        </div>
    </div>
</main>

<style>

    .modal-outer {
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgb(0,0,0);
        background-color: rgba(0,0,0,0.4);
        overflow: auto;
        z-index: 1000;
    }

    /*
    .modal-box {
        background-color: white;
        padding: 10px;
        margin: 15% auto;
        width: 80%;
        border: 1px solid brown;
    }*/
    .modal-box {
        position: fixed;
        left: 0;
        background-color: white;
        width: 100vw;
        padding: 50px;
        word-wrap: break-word;
    }

    .modal-box.bottom {
        bottom: 0;
    }

    .modal-box.top {
        top: 0;
    }

    .choices {
        margin-top: 10px;
    }

    /*
    .choices > button {
        width: 49%;
    }*/

</style>
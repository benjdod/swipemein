<script>

    export let confirm = 'confirm'
    export let deny = 'deny'
    export let confirmaction = () => {};
    export let denyaction = () => {};

</script>

<main>
    <div class="modal-outer">
        <div class="modal-box">
            <slot/>
            <br>
            <div class="choices">
                <button class="halfwidth" on:click={denyaction}>{deny}</button>
                <button class="halfwidth" on:click={confirmaction}>{confirm}</button>
            </div>
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
        bottom: 0;
        left: 0;
        background-color: white;
        width: 100vw;
        padding: 50px;
        word-wrap: break-word;
    }

    .choices {
        margin-top: 10px;
    }

    /*
    .choices > button {
        width: 49%;
    }*/

</style>
<!--
    @component 
    This is a canonical text composer -- e.g. textbox and send button. 
    @param {string} value           The value of the text input. This should be bound to to retrieve the composer's content.
    @param {string} placeholder     The text input's placeholder string.
    @param {function} sendMessage   The send message handler.
-->

<script>

    export let value = '';
    export let placeholder = 'send a message...';
    export let sendMessage = () => {};

</script>

<main>
    <div class="composer">
        <input type="text" bind:value={value} placeholder={placeholder} on:keyup={e => {if (e.key === 'Enter') sendMessage()}}>
        <button on:click={sendMessage}>Send</button>
    </div>
</main>

<style>
    .composer {
        position: fixed;
        bottom: 0;
        width: 100%;
        background-color: rgb(223, 223, 223);
    }

    .composer input {
        width: 79%;
    }

    .composer button {
        width: 19%;
        border: none;
        border-radius: 5px;;
        background-color: #13294B;
        color: white;
        font-weight: 700;

    }
</style>
<!--@component

    This is a view for a chat conversation. Text bubbles.

    @param {Object[]} messages      Array of message objects to be displayed. Schema described below. 
    @param {string} selfId   The viewer's participant ID. 

    The schema of a message object is described below.

    ```
{
    p: string,      // participant ID
    text: string    // message text
}
    ```
-->

<script>
import Chat from "../../pages/chat.svelte";



    //import * as animateScroll from "svelte-scrollto"

    export let messages = [];
    export let selfId = '0';

    let messageWindow;

    let last_time = '';
    let side = 0;

    $: if (messages.length > 0) {
        last_time = (new Date(Date.now())).toString().substring(16,21);
        side = messages[messages.length-1].p;
    }

</script>

<main>
    <div class="messages" bind:this={messageWindow}>
        {#if messages.length == 0}
            <div class="prompt">
                <p>Feel free to send a message!</p>
            </div>
        {:else}
            {#each messages as msg}
            <div class="message-row" class:sender={msg.p === selfId}>
                <div class="message-container" class:sender={msg.p === selfId}>
                    <p class:sender={msg.p === selfId}>{msg.body}</p>
                </div>
            </div>
            {/each}
            <p>{last_time ? last_time : ''}</p>
            <div style="height: 60px"/>
        {/if}
    </div>
</main>

<style>

.messages {
    overflow-y: auto;
}

div.prompt {
    text-align: center;
    padding: 20px;
}

.prompt p {
    color: #bbb;
}

.messages p {
    display: inline-block;
    padding: 0px;
    margin: 0;
}

.message-row{
    width: 100%;
    padding: 5px 0;
}

.message-row.sender {
    text-align: right;
}

.message-container {
    display: inline-block;
    background-color: rgb(105, 127, 143);
    color: white;
    padding: 10px;
    margin: 0 5px;
    border-radius: 5px;
    max-width: 80%;
    text-align: left;
}

.message-container.sender {
    background-color: rgb(228, 228, 228);
    color: rgb(32, 32, 32);
}

</style>
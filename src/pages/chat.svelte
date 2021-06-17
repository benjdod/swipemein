<script>

    import ChatView from "../components/chatview.svelte"
    import BadWords from "bad-words"

    let client_message = ''

    let sendMessage = () => {}

    let chat_messages = []

    const languageFilter = new BadWords();

    try {
        const chat_session = Math.floor(Date.now() / (10 * 1000));
        const ws = new WebSocket(`ws://localhost:8080/ws/chat/${chat_session}`);

        console.log('your chat session: ', chat_session);

        ws.onmessage = ({data}) => {
            chat_messages = [...chat_messages, {p: 1, text: data.toString(), time: Date.now()}];
        }

        sendMessage = () => {
            if (client_message != '') {
                if (languageFilter.isProfane(client_message)) {
                    client_message = languageFilter.clean(client_message);
                    return;
                } 

                ws.send(client_message);
                chat_messages = [...chat_messages, {p: 0, text: client_message, time: Date.now()}];
            }
        
            client_message = '';
        }

    } catch (e) {
        console.error(e);
    }

    
</script>

<main>
    <div style="overflow: hidden;">
        <ChatView messages={chat_messages}/>
        <div class="composer">
            <input type="text" bind:value={client_message} placeholder="send a message..." on:keyup={e => {if (e.key === 'Enter') sendMessage()}}>
            <button on:click={sendMessage}>Send</button>
        </div>
        
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
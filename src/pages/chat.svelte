<script>

    import ChatView from "../components/chatview.svelte"
    import ChatComposer from "../components/chatcomposer.svelte"
    import { getCookies } from "../util/doc-cookies"
    import BadWords from "bad-words"

    let client_message = ''

    let sendMessage = () => {}

    let chat_messages = []

    let participantId = '0';

    const languageFilter = new BadWords();

    /**
     * @throws Error
     */
    const initChatSession = () => {
        const chat_session = Math.floor(Date.now() / (10 * 1000));

        const cookies = getCookies();

        if (! 'smi-session-id' in cookies) {
            const err = "could not initialize a chat session due to missing session id!"
            throw Error(err);
        }

        // using chat protocol v0.1
        const ws = new WebSocket(`ws://localhost:8080/ws/chat/${cookies['smi-session-id']}`, `chat.smi.com`);

        const pushNewMessage = ({data}) => {
            chat_messages = [...chat_messages, {p: 1, text: data.toString(), time: Date.now()}];
        }

        ws.onmessage = ({data}) => {
            // get participant ID, then set to PushNewMessage
            console.log(`new message: `, data);
        }

        sendMessage = () => {
            if (client_message != '') {
                if (languageFilter.isProfane(client_message)) {
                    client_message = languageFilter.clean(client_message);
                    return;
                } 

                ws.send(client_message);
                chat_messages = [...chat_messages, {p: 0, text: client_message, time: Date.now()}];
                client_message = '';
            }
        }
    }

    try {
        initChatSession();
    } catch (e) {
        console.error(e);
    }

    
</script>

<main>
    <div style="overflow: hidden;">
        <ChatView messages={chat_messages} selfId="0"/>
        <ChatComposer bind:value={client_message} sendMessage={sendMessage}/>        
    </div>
</main>

<style>

</style>
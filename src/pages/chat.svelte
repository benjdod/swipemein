<script>

    import ChatView from "../components/chatview.svelte"
    import ChatComposer from "../components/chatcomposer.svelte"
    import { getCookies, hasCookie } from "../util/doc-cookies"
    import { ptc, createTextualMessage, createControlMessage, parseMessage } from "../util/chat-message-format"
    import BadWords from "bad-words"
    import { navigate } from "svelte-routing";

    let client_message = ''

    let sendMessage = () => {}

    let chat_messages = []

    let participantId = '0';

    const languageFilter = new BadWords();
    languageFilter.removeWords(
        'hell',
        'damn',
        'sadist'
    );

    /**
     * @throws Error
     */
    const initChatSession = () => {

        const cookies = getCookies();

        if (! 'smi-session-id' in cookies) {
            const err = "could not initialize a chat session due to missing session id!"
            throw Error(err);
        }

        // using chat protocol v0.1
        const ws = new WebSocket(`ws://localhost:8080/ws/chat/${decodeURIComponent(cookies['smi-session-id'])}`, `chat.smi.com`);

        let firstMessage = true;

        const handleMessage = ({data}) => { 

            // handle initialization response from server (see protocol)
            if (firstMessage) {
                console.log('received participant id: ', data);
                document.cookie = `smi-participant-id=${data}`;
                participantId = data; 
                firstMessage = false;
                return;
            }
            
            const message = parseMessage(data);
            console.log(data);
            console.log(message);

            if (message.type == ptc.TXT.str) {
                chat_messages = [...chat_messages, message];
            }
        }

        ws.onmessage = handleMessage;
        ws.onopen = () => {
            // if the user reloaded, resend the id
            if (hasCookie(`smi-participant-id`)) {
                console.log('sending stored participant id: ', getCookies()['smi-participant-id']);
                ws.send(getCookies()['smi-participant-id']);
            } else {
                // say hello!
                console.log('sending a hello message to get a new participant ID');
                ws.send('hello');
            }
        }
        /*ws.removeEventListener('message',getParticipantId);
        ws.onmessage = ({data}) => {
            // get participant ID, then set to PushNewMessage
            console.log(`new message: `, data);
        }*/

        sendMessage = () => {
            if (client_message != '') {
                if (languageFilter.isProfane(client_message)) {
                    client_message = languageFilter.clean(client_message);
                    return;
                } 

                const newMessage = createTextualMessage(participantId, client_message);

                try {
                    ws.send(newMessage);
                    chat_messages = [...chat_messages, parseMessage(newMessage)];
                    client_message = '';
                } catch (e) {
                    console.error(e);
                    alert('there was an error while sending your message!');
                }
            }
        }
    }

    try {
        initChatSession();
    } catch (e) {
        console.error(e);
    }

    const cancelPendingRequest = () => {
        navigate('/', {
            replace: true
        })
    }

    
</script>

<main>
    <div style="overflow: hidden;">
        <div>
            <button on:click={cancelPendingRequest}>Cancel</button>
        </div>
        <ChatView messages={chat_messages} selfId={participantId}/>
        <ChatComposer bind:value={client_message} sendMessage={sendMessage}/>        
    </div>
</main>

<style>

</style>
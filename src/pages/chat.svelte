<script>

    import MessageView from "../components/chat/messageview.svelte"
    import ChatComposer from "../components/chat/chatcomposer.svelte"
    import { getCookies, hasCookie } from "../util/doc-cookies"
    import { ptc, createTextualMessage, parseMessage, createGeoMessage } from "../util/chat-message-format"
    import BadWords from "bad-words"
    import { navigate } from "svelte-routing";
    import { link } from "svelte-routing"
    import Chatmap from "../components/chat/chatmap.svelte";

	console.log('hello')

    let composer_value = ''
    let sendMessage = () => {}
    let chat_messages = []
    let participantId = '0';
    let errorMessage = '';
    let coords = {
		lat: 35.910534,
		lng: -79.048764
    };
    let mycoords = {
		latitude: 35.910534,
		longitude: -79.048764
    };
    let geoInterval;

    const languageFilter = new BadWords();
    languageFilter.removeWords(
        'hell',
        'damn',
        'sadist',
        'screw'
    );


    let closeWebSocket = () => {};

    /**
     * @throws Error
     */
    const initChatSession = () => {

        const cookies = getCookies();

        if (! 'smi-session-id' in cookies) {
            const err = "could not initialize a chat session due to missing session id!"
            setErrorState(err);
            throw Error(err);
        }



        // using chat protocol v0.1
        const ws = new WebSocket(`ws://localhost:8080/ws/chat/${decodeURIComponent(cookies['smi-session-id'])}`, `chat.smi.com`);

        closeWebSocket = (code) => ws.close(code);

        let firstMessage = true;

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

				const sendCurrentCoords = (pos) => {
						if (mycoords.latitude != pos.coords.latitude || mycoords.longitude != pos.coords.longitude) {
							mycoords.latitude = pos.coords.latitude;
							mycoords.longitude = pos.coords.longitude;
                            if (ws.readyState == ws.OPEN)
                                ws.send(createGeoMessage(participantId, mycoords.latitude, mycoords.longitude));
						}
					}

				const id = navigator.geolocation.watchPosition(sendCurrentCoords, (err) => console.error(err), {
						enableHighAccuracy: true,
						maximumAge: 0,
						timeout: 10000
					});
				/*
            geoInterval = setInterval(() => {
                ws.send(createGeoMessage(participantId, mycoords.lat, mycoords.lng));
                mycoords.lat += 0.005;
                mycoords.lng += 0.007;
            }, 2000); */
        }

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
            console.log(`received message: `, message);
            // console.log(data);

            if (message.type == ptc.CTRL.str) {
                if (message.body == 'CANCEL') {
                    // request pend is cancelled; notify user accordingly
                    alert('this offer has been cancelled by the other party. You will be redirected');

                    try {
                        clearInterval(geoInterval)
                    } catch (e) {}

                    closeWebSocket();
					document.cookie = "smi-session-id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
					document.cookie = "smi-participant-id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

                    const to = hasCookie('smi-request') ? '/active-request' : '/requests'

                    setTimeout(() => {
                        navigate(to, {replace: true});
                    }, 3);
                }
            } else if (message.type == ptc.TXT.str) {
                chat_messages = [...chat_messages, message];
            } else if (message.type == ptc.GEO.str) {
                coords = message.body;
				coords.latitude = message.body.latitude;
            }
        }

        ws.onmessage = handleMessage;

        ws.onclose = () => {setErrorState('you are not connected to the chat server!')}

        sendMessage = () => {
            if (composer_value != '') {
                if (languageFilter.isProfane(composer_value)) {
                    composer_value = languageFilter.clean(composer_value);
                    return;
                } 

                const newMessage = createTextualMessage(participantId, composer_value);

                try {
                    ws.send(newMessage);
                    chat_messages = [...chat_messages, parseMessage(newMessage)];
                    composer_value = '';
                } catch (e) {
                    if (ws.readyState != ws.OPEN)
                        setErrorState('you are not connected to the chat server!')
                    else 
                        setErrorState('could not send your message');
                }
            }
        }

        
    }

    try {
        initChatSession();
    } catch (e) {
        setErrorState(e);
    }

    const cancelPendingRequest = () => {
        fetch('/api/data/unpend-request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                score: parseInt(getCookies()['smi-request']),
                p: participantId,
                sessionId: decodeURIComponent(getCookies()['smi-session-id'])
            })
        }).then(r => {

            if (r.status != 200) throw Error('bad response from server');

            clearInterval(geoInterval);
            closeWebSocket();
            const to = hasCookie('smi-request-key') ? '/active-request' : '/requests'
            navigate(to, {
                replace: true
            })
        }).catch(e => {
            setErrorState('could not unpend request!');
        })
    }

    const setErrorState = (message) => {
        errorMessage = message;
    }

	const completePendingRequest = () => {}

    
</script>

<div>
    <div style="overflow: hidden;">
        <Chatmap height={300} coords={[coords.lat, coords.lng]}/>
        <div>
            <a use:link href="/">Home</a>
            <button on:click={cancelPendingRequest}>Cancel</button>
			<button on:click={completePendingRequest}>Complete</button>
            {#if errorMessage.length > 0}
                <div style="color: #e55; background-color: #ddd;">
                    <h4>Error!</h4>
                    <p >{errorMessage}</p>
                </div>
            {/if}
        </div>
        <MessageView messages={chat_messages} selfId={participantId}/>
        <ChatComposer bind:value={composer_value} sendMessage={sendMessage}/>        
    </div>
</div>

<style>

</style>

<!--
    This is the page that a requester waits on for someone to pick theirs.
    It displays information about their request and when it was created
-->

<script>

    import { getDocCookies } from '../../util/doc-cookies'
    import { dayMinutesToString, getDayMinutes, getDayMilliseconds } from '../../util/listtime'
    import { onMount } from 'svelte'
    import { navigate } from 'svelte-routing';
    import ConfirmDialog from "../../components/confirmpopdown.svelte"

    let isActive = false;
    let accepted = false;
    let offerSessionId = '';

    let err = {
        noFields: false,
        noConnection: false,
        message: ''
    }

    let dialog = {
        delete: false,
        renew: false
    }

    // parse request fields from the previously stored cookie
    let fields = {};
    let cookies = getDocCookies();
    if (cookies['smi-request']) {
        let r =  JSON.parse(decodeURIComponent (cookies['smi-request']));
        fields = {...r};
    } else {
        err.noFields = true;
    }

    // if the time display is still displaying a time in the future,
    // set a timeout that changes it when the request becomes active
    const msec = getDayMilliseconds();
    const time_ms = fields.time * 60 * 1000;
    if (msec > time_ms) {
        isActive = true;
    } else {
        setTimeout(() => {
            isActive = true;
        }, time_ms - msec);
    }

    onMount(() => {

        if (err.noFields) navigate('/new-request');

        const setNoConnection = () => {err.noConnection = true; err.message = 'You\'re not connected! Refresh to reconnect'}

        try {
            const ws = new WebSocket(`ws://localhost:8080/ws/request/${fields.uid}`);
            ws.onmessage = ({data}) => {

                data = JSON.parse(data);

                

                if (data.type == 'accept') {

                    /* we know data is in the form of:
                        {
                            type: "accept",
                            id: <session id string>
                        }
                    */ 

                    accepted = true;
                    offerSessionId = data.id;
                }
            }
            ws.onerror = setNoConnection;
            ws.onclose = setNoConnection;
        } catch (e) {
            console.error(e);
            setNoConnection();
        }
    })

    /*
    let hours = parseInt(fields.time.substring(0,2));
    let minutes = parseInt(fields.time.substring(3));
    fields.time = dayMinutesToString(hours * 60 + minutes);*/

    const deleteRequest = () => {

        console.log('deleting request: ', fields);

        fetch('/api/data/request', {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'DELETE',
            body: JSON.stringify(fields)
        }).then(res => {
            navigate('/');
        }).catch(err => {
            console.error(err);
        })
    }

    const rejectOffer = () => {

    }

    const acceptOffer = () => {

        if (offerSessionId == '') {
            console.error("no offer has been extended yet");
            return;
        }

        document.cookie = `smi-session-id=${offerSessionId}`;
        navigate('/chat', {replace: true});
    }

</script>

<main>
    <div class="frame">
        <p class="active-at">Request active at:</p>
        <h1 class="time">{isActive ? 'now' : dayMinutesToString(fields.time, {militaryTime: true})}</h1>

        {#if isActive && ! err.noConnection}
        <div style="width: 15px; margin: 0 auto;" class="blink">
            <div style="display: block;">
                <svg viewBox="0 0 100 100">
                    <g color="#7d8">
                        <circle cx="50" cy="50" r="50" fill="currentcolor"/>
                    </g>
                </svg>
            </div>
        </div>
        {/if}

        <p class="message">"{fields.message}"</p>

        <div class="fullwidth">
            <button class="delete fullwidth" on:click={() => {dialog.delete = true;}}>Delete</button>
            <!--
                <button class="halfwidth renew">Renew</button>
            -->
        </div>
        {#if dialog.delete}
            <ConfirmDialog confirm="Delete" deny="cancel" denyaction={() => dialog.delete=false} confirmaction={deleteRequest}>Are you sure you want to delete your request?</ConfirmDialog>
        {/if}
        {#if accepted}
            <ConfirmDialog confirm="Yes" deny="No" confirmaction={acceptOffer} denyaction={rejectOffer}>Someone has offered you a request, do you accept?</ConfirmDialog>
        {/if}
        {#if err.noConnection}
        <div class="error">
            <p>Error: {err.message}</p>
        </div>
        {/if}
    </div>
</main>

<style>


.blink {
    animation: blinker 2s step-start infinite;
}

@keyframes blinker {
    50% {
    opacity: 0;
    }
}


.frame {
    text-align: center;
    margin: 0 auto;
    width: 90%;
}

.fullwidth {
    width: 100%;
}

button {
    width: 49%;
    border: none;
    font-weight: 400;
    font-size: 24px;
    border-radius: 10px;
}

button.delete {
    background-color: rgb(248, 127, 113);
    color: white;
}


.active-at {
    font-size: 16px;
}

h1.time {
    padding: 0; margin: 0;
    font-size: 100px;
    font-family: monospace;
    color: #444;
}

p.message {
    color: #aaa;
    font-weight: 20;
    font-size: 24px;
}

</style>
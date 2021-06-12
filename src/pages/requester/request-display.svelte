<!--
    This is the page that a requester waits on for someone to pick theirs.
    It displays information about their request and when it was created
-->

<script>

    import { getDocCookies } from '../../util/doc-cookies'
    import { dayMinutesToString } from '../../util/listtime'
    import { onMount } from 'svelte'
    import { navigate } from 'svelte-routing';

    let hasError = false;

    let fields = {};

    let cookies = getDocCookies();
    if (cookies['smi-request']) {
        let r =  JSON.parse(decodeURIComponent (cookies['smi-request']));
        fields = {...r};
    } else {
        hasError = true;
    }

    onMount(() => {
        if (hasError) navigate('/new-request');
    })

    /*
    let hours = parseInt(fields.time.substring(0,2));
    let minutes = parseInt(fields.time.substring(3));
    fields.time = dayMinutesToString(hours * 60 + minutes);*/

    const deleteRequest = () => {
        fetch('/api/data/request', {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'DELETE',
            body: JSON.stringify({uid: fields.uid})
        }).then(res => {
            navigate('/');
        }).catch(err => {
            console.error(err);
        })
    }

</script>

<main>
    <div class="frame">
        <p class="active-at">Request active at:</p>
        <h1 class="time">{fields.time}</h1>
        <p class="message">"{fields.message}"</p>

        <div class="fullwidth">
            <button class="halfwidth delete" on:click={deleteRequest}>Delete</button>
            <button class="halfwidth renew">Renew</button>
        </div>
    </div>
</main>

<style>

/*
.blink {
    animation: blinker 2s step-start infinite;
}

@keyframes blinker {
    50% {
    opacity: 0;
    }
}
*/

.frame {
    text-align: center;
    margin: 0 auto;
    width: 90%;
}

.fullwidth {
    width: 100%;
}

button.halfwidth {
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

button.renew {
    background-color: rgb(236, 233, 233);
    color:rgb(161, 161, 161);
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
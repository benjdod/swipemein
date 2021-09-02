<script>
import { navigate } from "svelte-routing";
import { getCookies } from "../util/doc-cookies";

import { dayMinutesToString } from "../util/listtime";

    export let time;                // time offset from 00:00 in minutes (e.g. 123 -> 2:03am)
    export let name;
    export let classyear;
    export let message;
    export let score;

    classyear = classyear % 100;    // chops the last two decimal digits from the classyear (e.g. 2024 -> 24)

    const acceptRequest = () => {
        console.log(`attempting to offer to request ${score}`);
        fetch('/api/data/pend-request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                score: score,
            }) 
        }).then(r => {
            //console.log("request offer succesfful");
            navigate('/chat', {replace: true});
        }).catch(e => {
            console.log('request offer failed');
            console.error(e);
        })
    }

</script>

<div class="listing" on:click={acceptRequest}>
    <h3><strong>{name} '{classyear}</strong> &middot; {dayMinutesToString(time, {militaryTime: false})}</h3> 
    <p>{message}</p>
</div>

<style>
    .listing {
        border: 2px solid #ccc;
        margin: 5px;
        padding: 10px;
    }
</style>

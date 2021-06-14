<!--
    This form is presented to any prospective provider 
    to get their name in case it can't be recovered from local storage
-->

<script>

import { link, navigate } from "svelte-routing"
import { onMount } from "svelte"
import { actionOnCookie, getDocCookies, navigateOnCookie } from "../../util/doc-cookies"
import ModalPopup from "../../components/modalpopup.svelte"

onMount(() => {
    /*
    let cookies = getDocCookies();
    if (cookies['smi-provider']) {
        navigate('/requests', {replace: 'true'});
    }*/
    navigateOnCookie('smi-provider', '/requests');
    actionOnCookie('smi-request', () => hasRequest = true);
})

let fields = {
    name: ''
}

let hasRequest = false;

let formError = {
    hasError: false,
    message: ''
}

function submitForm() {

    // validate fields
    if (fields.name == '') {
        formError.message = 'Please enter a valid first name';
    } else {
        formError.message = '';
    }
    if (formError.message != '') {formError.hasError = true; return false;}

    fetch('/api/data/provider', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(fields)
    }).then(r => {
        navigate('/requests');
    }).catch(e => {
        console.error(e);
        formError.hasError = true;
        formError.message = 'something went wrong internally; please refresh and try again.';
    })
}

const deleteRequest = () => {
    fetch('/api/data/request', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'DELETE',
        body: JSON.stringify({uid: fields.uid})
    }).then(res => {
        hasRequest = false;
    }).catch(err => {
        console.error(err);
        alert('could not delete request. Please refresh and try again');
    })
}

</script>

<main>
    {#if hasRequest}
        <ModalPopup
            confirmaction={deleteRequest}
            denyaction={() => navigate('/', {replace: true})}
            confirm="Yes"
            deny="No"
        >
            It looks like you have an active request. Do you want to cancel it and give a swipe instead?
        </ModalPopup>
    {/if}
    <form id="provider-form">
        <h2>What's your name?</h2>
        <input type="text" bind:value={fields.name}>
        <br>
    </form>
    {#if formError.hasError}
        <p>{formError.message}</p>
    {/if}
    <button on:click={submitForm}>Submit</button>
    <a use:link href="/">&LeftArrow; Back home</a>
</main>

<style>

</style>
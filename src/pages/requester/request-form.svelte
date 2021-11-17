<!--
    This form is presented to anyone requesting a swipe in order to 
    gather information and generate a request that can be added internally
-->

<script>

    import ModalPopup from "../../components/ui/popup/modal/dialog.svelte"

    import { onMount } from 'svelte'
    import { navigateOnCookie, actionOnCookie, getCookies } from '../../util/doc-cookies'
    import { navigate, link } from 'svelte-routing'

    // important constants
    const message_maxlength = 120;

    let formError = {
        hasError: false,
        message: ''
    }

    let fromProvider = false;

    onMount(() => {
        // if there is a previous request stored on the user's machine,
        // just navigate to the display page
        navigateOnCookie('smi-token', '/my-request');
        actionOnCookie('smi-provider', () => {
            fromProvider = true;
        })
    })

    // populate the fields objects which is bound to the form
    let now = new Date(Date.now());
    let hours = now.getHours();
	let minutes = now.getMinutes();
    if (minutes >= 60) minutes = 0;


    let init_time = `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}`;
    if (hours == 23 && minutes > 59) init_time = '00:00';

    let fields = {
        name: '',
        classyear: '',
        time: init_time,
        message: ''
    }

    let textboxLength = 0;

    const textboxCharCount = (e) => {
        const textbox = e.target;
        textboxLength = textbox.value.length;
    }

    const showEvent = (e) => console.log(e);

    function submitForm(e) {

        // validate fields, setting the formError message as necessary

        if (fields.name == '') {
            formError.message = 'Please enter a valid first name'
        } else if (fields.classyear == '' || ! fields.classyear.match(/^20[2-9][0-9]$/)) {
            formError.message = 'Please enter a valid graduation year'
        } else if (
            fields.time == '' ||
            fields.time.length != 5 ||
            ! fields.time.match(/[0-9][0-9]:[0-9][0-9]/)) {
            formError.message = 'Please enter a valid time'
        } else if (fields.message == '') {
            formError.message = 'Don\'t forget to leave a message';  
        } else (formError.message = '')

        if (formError.message != '') {formError.hasError = true; return false;} else formError.hasError = false;

        let newTime = parseInt(fields.time.substring(0,2)) * 60 + parseInt(fields.time.substring(3));

        fields.time = newTime;

        fetch('/api/data/request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(fields)
        }).then(r => {
            console.log(r.status);
            navigate('/my-request');
        }).catch(error => {
            console.error('submit request err: ', error);
            formError.hasError = true;
            formError.message = 'Internal server error. Please refresh and try again.'
        })
        return false;
    }

    const deleteProvider = () => {
        const cookies = getCookies();


        let prov_fields = JSON.parse(decodeURIComponent (cookies['smi-provider']));

        fetch('/api/data/provider', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({uid: prov_fields.uid})
        }).then(r => {
            fromProvider = false;
        }).catch(e => {
            console.error(e);
            alert('could not delete provider listing');
        })
    }

</script>

<main>
    {#if fromProvider}
        <ModalPopup 
            denyaction={() => navigate('/', {replace: true})}
            confirmaction={deleteProvider}
            deny="No, take me home"
            confirm="Yes, I need a swipe"
        >
            It looks like you have indicated that you can provide a swipe. Do you want to cancel and request instead?
        </ModalPopup>
    {/if}
    <div class="fullwidth">

        <form id="request-form">
            <label for="field-name">Your first name</label>
            <input type="text" placeholder="" id="field-name" bind:value={fields.name}>
            <br>
            <label for="field-classyear" >Graduation year</label>
            <input type="text" placeholder="e.g. 2022" id="field-classyear" inputmode="decimal" bind:value={fields.classyear}>
            <label for="field-time">Time</label>
            <input type="time" id="field-time" on:change={showEvent} bind:value={fields.time}>
            <br>
            <div id="field-message">
                <textarea placeholder="A short message..." on:input={textboxCharCount} id="field-message" bind:value={fields.message}></textarea>
                <p style="color: {textboxLength > message_maxlength ? 'red' : 'inherit'}">{textboxLength} / {message_maxlength}</p>
            </div>
            <br>
        </form>
        {#if formError.hasError}
            <p>{formError.message}</p>
        {/if}
        <button on:click={submitForm} id="submit-request">Submit!</button>
        <br>
        <a use:link href="/">&LeftArrow; Back home</a>
    </div>
</main>

<style>

.fullwidth {
    padding: 5% 10%;
    width: 100%;
}

</style>

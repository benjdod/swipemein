<!--
    This form is presented to anyone requesting a swipe in order to 
    gather information and generate a request that can be added internally
-->

<script>

    import { getDocCookies } from '../../util/doc-cookies'

    import { navigate } from 'svelte-routing'

    // important constants
    const message_maxlength = 120;
    const time_roundfactor = 5;

    let formError = {
        hasError: false,
        message: ''
    }


    // populate the fields objects which is bound to the form
    let now = new Date(Date.now());
    let minutes = Math.round(Math.ceil(now.getMinutes() / time_roundfactor) * time_roundfactor);
    let fields = {
        name: '',
        classyear: '',
        time: `${now.getHours()}:${minutes < 10 ? `0${minutes}` : minutes}`,
        message: ''
    }

    // if there is a previous request stored on the user's machine,
    // just navigate to the display page
    let cookies = getDocCookies();
    if (cookies['smi-request']) {
        //let oldrequest =  JSON.parse(decodeURIComponent (cookies['smi-request']));
        //fields = {...oldrequest};
        navigate('/active-request');
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
        } else if (fields.classyear == '' || ! fields.classyear.match(/20[2-9][0-9]/)) {
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


        fetch('/api/post-request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(fields)
        }).then(r => console.log(r.status)).catch(error => {
            console.error('submit request err: ', error);
        })
        return false;
    }

</script>

<main>
    <div class="fullwidth">

        <form id="request-form">
            <label for="field-name">Your first name</label>
            <input type="text" placeholder="" id="field-name" bind:value={fields.name}>
            <br>
            <label for="field-classyear" >Graduation year</label>
            <input type="text" placeholder="e.g. 2022" id="field-classyear" bind:value={fields.classyear}>
            <label for="field-time">Time</label>
            <input type="time" id="field-time" on:change={showEvent} bind:value={fields.time}>
            <br>
            <div>
                <textarea placeholder="A short message..." on:input={textboxCharCount} id="field-message" bind:value={fields.message}></textarea>
                <p style="color: {textboxLength > message_maxlength ? 'red' : 'inherit'}">{textboxLength} / {message_maxlength}</p>
            </div>
            <br>
        </form>
        {#if formError.hasError}
            <p>{formError.message}</p>
        {/if}
        <button on:click={submitForm}>Submit!</button>
    </div>
</main>

<style>
.fullwidth {
    padding: 10px;
    width: 100%;
}

</style>
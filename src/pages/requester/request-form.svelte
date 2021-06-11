<!--
    This form is presented to anyone requesting a swipe in order to 
    gather information and generate a request that can be added internally
-->

<script>

    import { onMount } from 'svelte';

    const message_maxlength = 120;

    let textboxLength = 0;

    const textboxCharCount = (e) => {
        const textbox = e.target;
        textboxLength = textbox.value.length;
    }

    onMount(() => {
        let _time_field = document.getElementById('field-time');
        console.log(_time_field);
        let now = new Date(Date.now());
        _time_field.value = `${now.getHours()}:${now.getMinutes()}`;
        //_time_field.value = "18:47";
    })

    const showEvent = (e) => console.log(e);

    function returnFalse() {return false;}

</script>

<main>
    <div class="fullwidth">
        <form>
            <label for="field-name">Your first name</label>
            <input type="text" placeholder="" id="field-name">
            <br>
            <label for="field-classyear">Graduation year</label>
            <input type="text" placeholder="e.g. 2022" id="field-classyear">
            <label for="field-time">Time</label>
            <input type="time" id="field-time" on:change={showEvent}>
            <br>
            <div>
                <textarea placeholder="A short message..." on:input={textboxCharCount}></textarea>
                <p style="color: {textboxLength > message_maxlength ? 'red' : 'inherit'}">{textboxLength} / {message_maxlength}</p>
            </div>
            <br>
            <input type="submit" value="Submit" onclick="return false;">
        </form>
    </div>
</main>

<style>
.fullwidth {
    width: 100%;
}
</style>
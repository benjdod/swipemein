<script>
    import Roundedbutton from "../components/ui/roundedbutton.svelte";
    import CaretDown from "../images/caret-down.svg";
    let swiperequest = {
        backgroundColor: '#13294B', //'#7BAFD4',
        color: '#ffffff' //'#2f759c'
    }

    let to_description = false;

</script>

<main>
    <div id="root">

        <div id="splashscreen">
            <div class="logo-zone">
                <h1 class="logo">SwipeMeIn<span style="color: #7BAFD4"><br>@UNC</span></h1>

            </div>

            <div class="control-zone">
                <div class="action-buttons">
                    <Roundedbutton backgroundColor={swiperequest.backgroundColor} color={swiperequest.color} nav_to="/new-request">I need a swipe</Roundedbutton>
                    <br>
                    <Roundedbutton backgroundColor={swiperequest.color} color={swiperequest.backgroundColor} nav_to="/new-provider">I have a swipe</Roundedbutton>
                </div>
		
                <div class="desc-prompt">
                    <a href="{to_description ? '#description' : '#'}"
                        on:click="{() => {
                            to_description = !to_description;
                            console.log(to_description);
                        }}"
                        style="text-decoration: none;"
                    >
                        <p style="text-decoration: none;">What is it?</p>
                        {#if to_description}
                            <img src={CaretDown} class="caret caret-up" alt="caret pointing up">
                        {:else}
                            <img src={CaretDown} class="caret caret-down" alt="caret pointing down">
                        {/if}
                    </a>
                </div>
            </div>	
        </div>

        <div id="description">
            <p>
                We all get hungry sometimes.
                <br><br>
                Whether you're running low on swipes for the semester or you want to swing by and reminisce your earlier college days, we've got you covered. You don't have to sit outside the dining hall with a sign or post on Facebook in hopes someone will come to your aid, you can simply do it from the comfort of wherever you are, no account necessary!
                <br><br>
                Needless to say, this app depends on the charity of students who have swipes, so if you've got an extra swipe, please share the love!
            </p>
        </div>
		
    </div>
</main>

<style>

@keyframes flip {
        from {
            transform: none;
        }
        to {
            transform: rotate(180deg);
        }
    }

    main {
        text-align: center;
        margin: 0;
        padding: 0;
    }

    p {
        font-size: 20px;

    }

    #root {
        display: inline-block;
    }

    #splashscreen {
        height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        background-color: #fff;
    }

    #description {
        background-color: rgb(129, 143, 163);
    }

    #splashscreen .logo-zone {
        height: 55%;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    #splashscreen .logo {
        padding-top: 50px;
    }

    .action-buttons {
        padding: 0 0 10vh;
    }

    .desc-prompt {
        /*
        position: absolute;
        bottom: 50px;
        */
        color: #000000;
        opacity: 0.5;
    }

    .desc-prompt .caret {
        display: inline-block;
        width: 32px;
        transition: all 0.5s linear 0s;
    }

    .desc-prompt .caret-up {
        transform: rotate(-180deg);

    }

    #description p {
        padding: 25px;
    }

    @media (min-width: 640px) {
        main {
            max-width: none;
        }
    }

	
</style>
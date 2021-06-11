<script>
    import Roundedbutton from "../components/ui/roundedbutton.svelte";
    import CaretDown from "../images/caret-down.svg";
    let swiperequest = {
        backgroundColor: '#85CFF9',
        color: '#2f759c'
    }

    let to_description = false;

</script>

<main>
    <div id="root">

        <div id="splashscreen">
            <div class="logo-zone">
                <h1 class="logo">SwipeMeIn</h1>

            </div>

            <div class="control-zone">
                <div class="action-buttons">
                    <Roundedbutton backgroundColor={swiperequest.backgroundColor} color={swiperequest.color} nav_to="/new-request">I need a swipe</Roundedbutton>
                    <br>
                    <Roundedbutton nav_to="/new-provider">I have a swipe</Roundedbutton>
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
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla aliquet aliquet odio id feugiat. Cras at sapien velit. Maecenas ullamcorper felis id dolor ultrices, a egestas turpis mollis. Nulla sed nisi id nunc semper ultricies. Pellentesque et eros congue, luctus odio ut, pulvinar mauris. Fusce mattis auctor metus ac elementum. Vivamus commodo vitae felis eget dapibus. Nunc eget purus consequat, congue dui sit amet, gravida augue. Proin tempor bibendum rutrum. Praesent sed mauris at lorem auctor fermentum. Nunc velit sem, congue vel sagittis ut, lacinia et felis. Aliquam rutrum nisi a porta sollicitudin. Ut urna nisl, cursus eget mauris eu, viverra vulputate tellus. Etiam rutrum venenatis mi, sit amet dictum nulla malesuada in.</p>
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
        background-color: #eef;
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
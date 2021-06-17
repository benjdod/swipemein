<script>

    import { link } from "svelte-routing";

</script>

<main>
    <div class="frame">
        <h2>There's nothing here!</h2>
        <a use:link href="/">Take me home</a>
    </div>
</main>

<style>
    .frame {
        text-align: center;
    }

    a {
        text-decoration: none;
        color: #888;
    }

    a:hover {
        color: #333;
    }
</style>
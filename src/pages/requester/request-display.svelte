<!--
    This is the page that a requester waits on for someone to pick theirs.
    It displays information about their request and when it was created
-->

<script>

    import { getDocCookies } from '../../util/doc-cookies'

    let hasError = false;

    let fields = {};

    let cookies = getDocCookies();
    if (cookies['smi-request']) {
        let oldrequest =  JSON.parse(decodeURIComponent (cookies['smi-request']));
        fields = {...oldrequest};
    } else {
        hasError = true;
    }


</script>

<main>
    <div>
        <h2>{fields.name}</h2>
    </div>
</main>

<style>

</style>
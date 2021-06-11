<script>
    import Requestlisting from "../../components/requestlisting.svelte";
    import "../../util/listtime"


    const listings = [
        {
            name: "Bardo", classyear: 2022, time: (9+12)*60, message: "hello, I am Bardo. Pleased to meet you."
        },
        {
            name: "Hanah", classyear: 2024, time: 180, message: "lookin for a late night swip "
        },
        {
            name: "Eli Whitney", classyear: 2023, time: 300, message: "I invented the cotton gin!", uid: "45ead3"
        }
    ]   

    console.log("document cookie: ", document.cookie)

</script>

<main>
    <div id="listings">
        {#each listings as listing}
            <Requestlisting {...listing}></Requestlisting>
        {/each}
    </div>
</main>

<style>


</style>
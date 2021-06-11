<script>
import { dayMinutesToString } from "../util/listtime";

    export let time;                // time offset from 00:00 in minutes (e.g. 123 -> 2:03am)
    export let name;
    export let classyear;
    export let message;
    export let uid;

    classyear = classyear % 100;    // chops the last two decimal digits from the classyear (e.g. 2024 -> 24)

</script>

<div id={`listing-${uid}`}>
    <h3><strong>{name} '{classyear}</strong> &middot; {dayMinutesToString(time, {militaryTime: false})}</h3> 
    <p>{message}</p>
</div>

<style>
</style>
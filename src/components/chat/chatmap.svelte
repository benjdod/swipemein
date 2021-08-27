<script>

    import * as L from "leaflet"
    import * as HomeIcon from "../../util/homeicon" 

    import "leaflet/dist/leaflet.css"

    let map;

    const makeMap = (div) => {
        let m = L.map(div).setView([51.505,-0.09], 13);
        L.tileLayer(
            'https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png',
            {
                attribution: `&copy;<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>,
                    &copy;<a href="https://carto.com/attributions" target="_blank">CARTO</a>`,
                subdomains: 'abcd',
                maxZoom: 16,
            }
        ).addTo(m);

        return m;
    }

    const mapAction = (div) => {
        map = makeMap(div);
        return {
            destroy: () => {
                map.remove();
            }
        }
    }

    const handleLatLng = (latlng) => {
        if (map) {
            map.panTo(latlng, 16);
        }
    }

    /**
     * 
     * @param {Array[]} coords - array of lat lon coord sets
     */
    const calculateCoordsCenter = (coords) => {

        if (coords.length > 0 ) {
            if (typeof coords[0] == 'number') {
                return coords;
            }
        }

        const n = coords.length;
        let latsum = 0, lonsum = 0;
        coords.forEach(c => {
            console.log(c);
            latsum += c[0];
            lonsum += c[1];
        })
        latsum /= n; lonsum /= n;
        return [latsum, lonsum];
    }

    export let height;
    export let coords;

    $: {
        const newCenter = calculateCoordsCenter(coords);
        console.log('new center: ' , newCenter);
        handleLatLng(newCenter);
    }
    
</script>

<div class="map-container" style="height: {parseInt(height)||400}px" use:mapAction></div>

<style>
.map-container {
    width: 100%;

}
</style>
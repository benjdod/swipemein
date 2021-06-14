export const dayMinutesToString = (minutes, opts) => {
    /**
     * Takes an integer number of minutes in a day and creates a human readable 
     * string denoting the time of day.
     */

    const options = opts || {};
    const to_24hr = options.militaryTime != null ? options.militaryTime : false;
    const meridianPeriod = options.meridianFormat || 'lower';       // lower, upper, period

    minutes %= 1440;        // mod by 60 minutes * 24 hours for consistent results

    let hours = Math.floor(minutes / 60);

    if (to_24hr) {
        return `${hours}:${minutes % 60 < 10 ? `0` + minutes % 60 : minutes % 60}`;
    } else {
        let meridian = "am";
        if (hours >= 12) {
            hours %= 12;
                
            meridian = (meridianPeriod == 'lower') 
                ? 'pm'
                : (meridianPeriod == 'upper')
                ? 'PM'
                : 'P.M.'
        } else {
            meridian = (meridianPeriod == 'lower') 
            ? 'am'
            : (meridianPeriod == 'upper')
            ? 'AM'
            : 'A.M.'
        }

        if (hours == 0) hours = 12;

        return `${hours}${minutes % 60 == 0 ? meridian : minutes % 60 < 10 ? `:0` + minutes + " " + meridian % 60 : ':' + minutes % 60 + " " + meridian}`
    }
}

export const getDayMinutes = () => {
    const now = new Date(Date.now());

    return now.getHours() * 60 + now.getMinutes();
}

export const getDayMilliseconds = () => {
    const now = new Date(Date.now());

    return (now.getHours() * 60 * 60 + now.getMinutes() * 60 + now.getSeconds()) * 1000 + now.getMilliseconds();
}
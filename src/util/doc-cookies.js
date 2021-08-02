import { navigate } from "svelte-routing";

export const getCookies = () => {
    return Object.fromEntries(document.cookie.split('; ').map(c => {
        const [ key, ...v ] = c.split('=');
        return [ key, v.join('=') ];
    }));
}

/**
 * @param {string} cookieKey 
 * @returns {boolean}
 */
export const hasCookie = (cookieKey) => {
    const cookies = getCookies();
    return (cookieKey in cookies);
}

/**
 * 
 * @param {string} cookiename 
 * @param {string} route 
 */
export const navigateOnCookie = (cookiename, route) => {
    const cookies = getCookies();
    if (cookies[cookiename] !== undefined) {
        navigate(route);
    }
}

/**
 * @callback cookieAction
 */

/**
 * @param {*} cookiename 
 * @param {cookieAction} action 
 */
export const actionOnCookie = (cookiename, action) => {
    const cookies = getCookies();
    if (cookies[cookiename] !== undefined) {
        action();
    }
}
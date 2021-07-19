import { navigate } from "svelte-routing";

export const getCookies = () => {
    return Object.fromEntries(document.cookie.split('; ').map(c => {
        const [ key, ...v ] = c.split('=');
        return [ key, v.join('=') ];
    }));
}

export const hasCookie = (cookieKey) => {
    const cookies = getCookies();
    return (cookieKey in cookies);
}

export const navigateOnCookie = (cookiename, route) => {
    const cookies = getCookies();
    if (cookies[cookiename] !== undefined) {
        navigate(route);
    }
}

export const actionOnCookie = (cookiename, action) => {
    const cookies = getCookies();
    if (cookies[cookiename] !== undefined) {
        action();
    }
}
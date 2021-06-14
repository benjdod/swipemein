import { navigate } from "svelte-routing";

export const getDocCookies = () => {
    return Object.fromEntries(document.cookie.split('; ').map(c => {
        const [ key, ...v ] = c.split('=');
        return [ key, v.join('=') ];
    }));
}

export const navigateOnCookie = (cookiename, route) => {
    const cookies = getDocCookies();
    if (cookies[cookiename] !== undefined) {
        navigate(route);
    }
}

export const actionOnCookie = (cookiename, action) => {
    const cookies = getDocCookies();
    if (cookies[cookiename] !== undefined) {
        action();
    }
}
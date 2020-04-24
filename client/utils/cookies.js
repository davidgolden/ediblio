import axios from 'axios';
import cookie from 'js-cookie';

export function getCookieFromServer (key, req) {
    if (!req.headers.cookie) {
        return undefined;
    }
    const rawCookie = req.headers.cookie
        .split(';')
        .find(c => c.trim().startsWith(`${key}=`));
    if (!rawCookie) {
        return undefined;
    }
    return rawCookie.split('=')[1];
}

export const clientFetch = {
    async get(url, data = {}) {
        const jwt = cookie.get('jwt');
        return axios.get(url, {
            headers: jwt ? {'x-access-token': jwt} : {},
            ...data,
        })
    },
    async post(url, body = {}) {
        const jwt = cookie.get('jwt');
        return axios.post(url, body, {
            headers: jwt ? {'x-access-token': jwt} : {},
        })
    },
    async patch(url, body = {}) {
        const jwt = cookie.get('jwt');
        return axios.patch(url, body, {
            headers: jwt ? {'x-access-token': jwt} : {},
        })
    },
    async delete(url, body) {
        const jwt = cookie.get('jwt');
        return axios.delete(url, {
            headers: jwt ? {'x-access-token': jwt} : {},
            ...body,
        })
    }
};

export function dateToUnix(date) {
    return Math.round((new Date()).getTime() / 1000);
}

export function getDaysSince(date, unix = false) {
    if (unix) {
        date = date * 1000;
    }
    return Math.round((new Date() - date)/(1000*60*60*24));
}

export function getUrlParts(req) {
    const currentBaseUrl = req.protocol + "://" + req.headers.host.replace(/\/$/, "");
    const currentFullUrl = currentBaseUrl + req.url;
    const jwt = getCookieFromServer('jwt', req);

    return {currentBaseUrl, currentFullUrl, jwt};
}

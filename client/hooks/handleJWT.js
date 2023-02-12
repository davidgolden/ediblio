import React from 'react';
import URI from 'urijs';
import Router from 'next/router';
import cookie from 'js-cookie';

export async function handleJWT() {
    const isServer = typeof window === 'undefined';

    if (!isServer) {
        let currentFullUrl = window.location.href;
        const currentFullUrlParts = URI(currentFullUrl);

        if (currentFullUrlParts.hasQuery('jwt')) {
            const query = currentFullUrlParts.query(true);

            if (!isServer && query.jwt) {
                cookie.set('jwt', query.jwt, {expires: 365, secure: true});
                currentFullUrl = currentFullUrlParts.removeQuery('jwt').path();
                await Router.push(currentFullUrl, currentFullUrl, {shallow: true});
            }
        }
    }
}

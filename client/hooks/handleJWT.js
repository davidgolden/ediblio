import React from 'react';
import jwt from 'jsonwebtoken';
import URI from 'urijs';
import Router from 'next/router';
import cookie from 'js-cookie';
export async function handleJWT(MobxStore, currentFullUrl) {

    const isServer = typeof window === 'undefined';

    const currentFullUrlParts = URI(isServer ? currentFullUrl : window.location.href);

    if (currentFullUrlParts.hasQuery('jwt')) {
        const query = currentFullUrlParts.query(true);

        if (!isServer && query.jwt) {
            cookie.set('jwt', query.jwt, {expires: 365, secure: true});
            currentFullUrl = currentFullUrlParts.removeQuery('jwt').path();
            await Router.push(currentFullUrl, currentFullUrl, {shallow: true});
        }
    }
}

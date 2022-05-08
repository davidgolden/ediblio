import React from 'react';
import axios from "axios";
import jwt from 'jsonwebtoken';
import URI from 'urijs';
import Router from 'next/router';
import cookie from 'js-cookie';
export async function handleJWT(MobxStore, currentFullUrl) {

    const isServer = typeof window === 'undefined';

    const currentFullUrlParts = URI(isServer ? currentFullUrl : window.location.href);

    if (currentFullUrlParts.hasQuery('jwt')) {
        const query = currentFullUrlParts.query(true);
        const decodedJWT = jwt.decode(query.jwt);

        if (isServer) {
            // decoded JWT consists of partial user
            MobxStore.setUser(decodedJWT.user);
        } else {
            // on the client, fetch the entirety of the user
            const response = await axios.get(`/api/users/${decodedJWT.user.id}`, {
                headers: {'x-access-token': query.jwt},
            });
            cookie.set('jwt', query.jwt);
            MobxStore.setUser(response.data.user);
            currentFullUrl = currentFullUrlParts.removeQuery('jwt').path();
            await Router.replace(currentFullUrl);
        }
    }
}

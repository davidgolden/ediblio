import React, {useContext} from 'react';
import axios from "axios";
import jwt from 'jsonwebtoken';
import {ApiStoreContext} from "../client/stores/api_store";
import URI from 'urijs';
import Router from 'next/router';

export async function handleJWT(currentFullUrl) {

    const isServer = typeof window === 'undefined';
    const context = useContext(ApiStoreContext);

    if (isServer) return;

    const currentFullUrlParts = URI(window.location.href);

    if (currentFullUrlParts.hasQuery('jwt')) {
        const query = currentFullUrlParts.query(true);
        const decodedJWT = jwt.decode(query.jwt);
        const response = await axios.get(`/api/users/${decodedJWT.id}`, {
            headers: {'x-access-token': query.jwt},
        });
        context.setUser(response.data.user);
        currentFullUrl = currentFullUrlParts.removeQuery('jwt').path();
        await Router.replace(currentFullUrl);
    }
}

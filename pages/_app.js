import React from "react";
import App from 'next/app'
import ErrorPage from "./_error";
import RecipeCloudHead from "../client/components/header/Head";
import Header from "../client/components/header/Header";
import Notification from "../client/components/header/Notification";
import AllModals from "../client/components/modals/styles/AllModals";
import {ApiStoreContext, loadStore, storeSingleton} from "../client/stores/api_store";
import "../client/styles/base.scss";
import "draft-js/dist/Draft.css";
import {enableStaticRendering} from "mobx-react";
import {handleJWT} from "../client/hooks/handleJWT";
import axios from "axios";
import JWT from "jsonwebtoken";

class MyDocument extends App {
    MobxStore;

    constructor(props) {
        super(props);

        const isServer = typeof window === 'undefined';

        if (isServer) {
            enableStaticRendering(true);
            this.MobxStore = loadStore();

        } else {
            enableStaticRendering(false);
            this.MobxStore = storeSingleton;
        }

        if (props.user) {
            this.MobxStore.setUser(props.user);
        }

        this.updateApp(props.pageProps);
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        this.updateApp(nextProps.pageProps);
        return true;
    }

    updateApp(pageProps) {
        handleJWT();
        if (pageProps.recipes) {
            this.MobxStore.addRecipes(pageProps.recipes, true);
        }
    }

    render() {
        try {
            const {Component, pageProps} = this.props;

            return (
                <ApiStoreContext.Provider value={this.MobxStore}>
                    <RecipeCloudHead/>
                    <AllModals />
                    <Header {...pageProps} />
                    <Notification {...pageProps} />
                    <Component {...pageProps} />
                </ApiStoreContext.Provider>
            )
        } catch (error) {
            return <ErrorPage error={error}/>
        }
    }
}

MyDocument.getInitialProps = async ({ctx}) => {
    const returnObj = {};
    if (ctx) {
        const jwt = ctx.query.jwt || ctx.req.cookies.jwt;

        if (jwt) {
            const decodedJWT = JWT.decode(jwt);
            const host = ctx.req.headers.host;
            const scheme = ctx.req.headers["x-forwarded-proto"] || "http";

            const response = await axios.get(`${scheme}://${host}/api/users/${decodedJWT.user.id}`, {
                headers: {'x-access-token': jwt},
            });
            returnObj.user = response.data.user;
        }
    }
    return returnObj;
};

export default MyDocument

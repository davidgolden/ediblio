import React from "react";
import App from 'next/app'
import ErrorPage from "./_error";
import RecipeCloudHead from "../client/components/header/Head";
import Header from "../client/components/header/Header";
import Notification from "../client/components/header/Notification";
import AllModals from "../client/components/modals/styles/AllModals";
import {ApiStoreContext, loadStore, storeSingleton} from "../client/stores/api_store";
import LogRocket from 'logrocket';
import "../client/styles/base.scss";
import "draft-js/dist/Draft.css";
import {useStaticRendering} from "mobx-react";

class MyDocument extends App {

    render() {
        try {
            const {Component, pageProps} = this.props;

            const isServer = typeof window === 'undefined';

            if (!isServer && process.env.NODE_ENV !== 'development') {
                LogRocket.init('gajlpv/recipe-cloud');
            }

            let MobxStore;
            if (isServer) {
                useStaticRendering(true);
                MobxStore = loadStore(this.props.jwt);
            } else {
                useStaticRendering(false);
                MobxStore = storeSingleton;
            }

            return (
                <ApiStoreContext.Provider value={MobxStore}>
                    <RecipeCloudHead/>
                    <AllModals />
                    <Header {...pageProps} ca={this.props.ca} />
                    <Notification {...pageProps} />
                    <Component {...pageProps} />
                </ApiStoreContext.Provider>
            )
        } catch (error) {
            return <ErrorPage error={error}/>
        }
    }
}

function getCookie(cookies, name) {
    const value = "; " + cookies;
    const parts = value.split("; " + name + "=");
    if (parts.length === 2) return parts.pop().split(";").shift();
}

MyDocument.getInitialProps = ({ctx}) => {
    const returnObj = {};
    if (ctx) {
        returnObj.td = ctx.req.cookies.td;
        returnObj.ca = ctx.req.cookies.ca;
        returnObj.jwt = ctx.req.cookies.jwt;
    }
    return returnObj;
};

export default MyDocument

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
import {handleJWT} from "../client/hooks/handleJWT";

class MyDocument extends App {
    MobxStore;

    constructor(props) {
        super(props);

        const isServer = typeof window === 'undefined';

        if (!isServer && process.env.NODE_ENV !== 'development') {
            LogRocket.init('gajlpv/recipe-cloud');
        }

        if (isServer) {
            useStaticRendering(true);
            this.MobxStore = loadStore(props.jwt);
        } else {
            useStaticRendering(false);
            this.MobxStore = storeSingleton;
        }

        this.updateApp(props.pageProps);
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        this.updateApp(nextProps.pageProps);
        return true;
    }

    updateApp(pageProps) {
        handleJWT(this.MobxStore, pageProps.currentFullUrl);
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

MyDocument.getInitialProps = ({ctx}) => {
    const returnObj = {};
    if (ctx) {
        returnObj.jwt = ctx.req.cookies.jwt;
    }
    return returnObj;
};

export default MyDocument

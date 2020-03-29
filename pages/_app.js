import React from "react";
import App from 'next/app'
import ErrorPage from "./_error";
import RecipeCloudHead from "../client/components/header/Head";
import Header from "../client/components/header/Header";
import Notification from "../client/components/header/Notification";
import AllModals from "../client/components/modals/styles/AllModals";
import {ApiStoreContext, loadStore, storeSingleton} from "../client/stores/api_store";
import LogRocket from 'logrocket';
import "../client/stylesheets/base.scss";
import "draft-js/dist/Draft.css";
import {useStaticRendering} from "mobx-react";
import TourContainer from "../client/components/tour/TourContainer";

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
                MobxStore = loadStore();
            } else {
                useStaticRendering(false);
                MobxStore = storeSingleton;
            }

            return (
                <ApiStoreContext.Provider value={MobxStore}>
                    <RecipeCloudHead/>
                    <AllModals />
                    <Header {...pageProps} />
                    <Notification {...pageProps} />
                    <Component {...pageProps} />
                    <TourContainer/>
                </ApiStoreContext.Provider>
            )
        } catch (error) {
            return <ErrorPage error={error}/>
        }
    }
}

export default MyDocument

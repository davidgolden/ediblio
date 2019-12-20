import {store} from "../client/src/store";
import {ApiStoreContext} from "../client/src/stores/api_store";
import React from "react";
import Header from "../client/src/components/header/Header";
import Notification from "../client/src/components/header/Notification";
import App from 'next/app'

class MyDocument extends App {

    render() {
        const {Component, pageProps} = this.props;
        return (
            <ApiStoreContext.Provider value={store}>
                <Header/>
                <Notification/>
                <Component {...pageProps} />
            </ApiStoreContext.Provider>
        )
    }
}

export default MyDocument

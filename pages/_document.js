import Document, {Html, Head, Main, NextScript} from 'next/document'
import {store} from "../client/src/store";
import {ApiStoreContext} from "../client/src/stores/api_store";
import React from "react";

class MyDocument extends Document {
    // static async getInitialProps(ctx) {
    //     const initialProps = await Document.getInitialProps(ctx)
    //     return {...initialProps}
    // }

    render() {
        return (
            <Html>
                <ApiStoreContext.Provider value={store}>
                    <Head/>
                    <body>
                    <Main/>
                    <NextScript/>
                    </body>
                </ApiStoreContext.Provider>
            </Html>
        )
    }
}

export default MyDocument

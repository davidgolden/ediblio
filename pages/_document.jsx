import Document, { Html, Head, Main, NextScript } from 'next/document'
import React from "react";

class Doc extends Document {
    static async getInitialProps(ctx) {
        const initialProps = await Document.getInitialProps(ctx)
        return { ...initialProps }
    }

    render() {
        return (
            <Html>
                <Head>
                    <link href="https://fonts.googleapis.com/css?family=Markazi+Text" rel="stylesheet"/>
                    <link rel={"stylesheet"} href={"https://use.fontawesome.com/releases/v5.2.0/css/all.css"}/>
                    <link rel={"manifest"} href={"/manifest.webmanifest"}/>
                    <link href="https://fonts.googleapis.com/css?family=EB+Garamond|Quicksand" rel="stylesheet"/>
                    <script src={"/installPrompt.js"} />
                </Head>
                <body>
                <Main />
                <NextScript />
                </body>
            </Html>
        )
    }
}

export default Doc

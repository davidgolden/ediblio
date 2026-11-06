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
                    {/* _document only renders on the server, so this reads CDN_URL at runtime
                        (publicRuntimeConfig is frozen at build time in standalone output). */}
                    <script dangerouslySetInnerHTML={{__html: `window.__CDN_URL__=${JSON.stringify(process.env.CDN_URL || "")};`}} />
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

const request = require('request').defaults({ encoding: null });

import urlMetadata from "url-metadata";

export default async function handler(req, res) {
    if (req.method === "POST") {
        urlMetadata(req.body.imageUrl, {timeout: 0}).then(
            async function (metadata) { // success handler
                const imageUrl = metadata["og:image"];

                request.get(imageUrl, function (err, response, body) {
                    return res.status(200).json(body);
                });
            },
            function (error) { // failure handler
                return res.status(404).send('')
            });
    }
}
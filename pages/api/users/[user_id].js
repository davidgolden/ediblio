import {prismaClient} from "../../../db/index";
import {usersSelector} from "../../../utils";
import {getUserIdFromRequest} from "../../../utils/serverUtils";
import {hashPassword} from "../../../utils";

const multer = require('multer');
const upload = multer();

import {S3} from "aws-sdk";
const s3 = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
})

export default async function handler(req, res) {
    if (req.method === "GET") {
        let response;
        const userId = getUserIdFromRequest(req);
        if (userId === req.query.user_id) {
            response = await prismaClient.$queryRawUnsafe(`${usersSelector} where users.id = '${req.query.user_id}' group by users.id;`)
        } else {
            response = await prismaClient.$queryRaw`SELECT username, profile_image FROM users WHERE users.id = ${req.query.user_id}::uuid;`
        }
        return res.status(200).json({
            user: response[0]
        });
    } else if (req.method === "PATCH") {
        upload.single("profile_picture")(req, {}, async err => {
            try {
                const userId = getUserIdFromRequest(req);

                const {username, email, password} = req.body;

                const updateValues = [];

                function updateQuery(key, value) {
                    updateValues.push(`${key} = '${value}'`);
                }

                if (typeof username === 'string') {
                    updateQuery('username', username);
                }
                if (typeof email === 'string') {
                    updateQuery('email', email);
                }
                if (typeof password === 'string') {
                    const userPasswords = await prismaClient.$queryRaw`SELECT password FROM users WHERE id = ${userId}::uuid;`;

                    if (password !== userPasswords[0].password) {
                        updateQuery('password', await hashPassword(password));
                    }
                }

                if (req.file) {
                    const imagePath = `users/${userId}/${req.file.originalname}`;
                    const data = await s3.upload({Bucket: "ediblio", Key: imagePath, Body: req.file.buffer}).promise();
                    updateQuery('profile_image', data.Key);
                }

                if (updateValues.length > 0) {
                    const users = await prismaClient.$queryRawUnsafe(`UPDATE users SET ${updateValues.join(", ")} WHERE id = '${userId}' RETURNING *;`)
                    return res.status(200).send({user: users[0]})
                }

                return res.status(200).send();

            } catch (error) {
                console.error(error);
                res.status(404).send({detail: error.message});
            }
        })
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
};
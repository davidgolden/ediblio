import db from "../../../db/index";
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

            response = await db.query({
                text: `${usersSelector}
where users.id = $1
group by users.id;`,
                values: [req.query.user_id]
            });
        } else {
            response = await db.query({
                text: `SELECT username, profile_image FROM users
                WHERE users.id = $1`,
                values: [req.query.user_id]
            })
        }
        return res.status(200).json({
            user: response.rows[0]
        });
    } else if (req.method === "PATCH") {
        upload.single("profile_picture")(req, {}, async err => {
            try {
                const userId = getUserIdFromRequest(req);

                const {username, email, password} = req.body;

                const updateValues = [];
                const values = [];

                function updateQuery(key, value) {
                    updateValues.push(`${key} = $${values.length + 1}`);
                    values.push(value);
                }

                if (typeof username === 'string') {
                    updateQuery('username', username);
                }
                if (typeof email === 'string') {
                    updateQuery('email', email);
                }
                if (typeof password === 'string') {
                    const userRes = await db.query({
                        text: `SELECT password FROM users WHERE id = $1`,
                        values: [userId],
                    });
                    if (password !== userRes.rows[0].password) {
                        updateQuery('password', await hashPassword(password));
                    }
                }

                if (req.file) {
                    const imagePath = `users/${userId}/${req.file.originalname}`;
                    const data = await s3.upload({Bucket: "ediblio", Key: imagePath, Body: req.file.buffer}).promise();
                    updateQuery('profile_image', data.Key);
                }

                if (updateValues.length > 0) {
                    const response = await db.query({
                        text: `UPDATE users SET ${updateValues.join(", ")} WHERE id = $${values.length + 1} RETURNING *`,
                        values: values.concat([userId]),
                    });

                    return res.status(200).send({user: response.rows[0]})
                }

                return res.status(200).send();

            } catch (error) {
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
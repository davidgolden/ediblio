import URLSafeBase64 from "urlsafe-base64";
import db from "../../db/index";
import nodemailer from "nodemailer";
import mg from "nodemailer-mailgun-transport";
import {getUserIdFromRequest} from "../../utils/serverUtils";

export default async function handler(req, res) {
    if (req.method === "POST") {
        const userId = getUserIdFromRequest(req);

        let email = req.body.email;
        if (userId) {
            return res.status(404).send({detail: 'User is already logged in!'})
        }

        (function generateToken() {
            let buf = Buffer.alloc(16);
            for (let i = 0; i < buf.length; i++) {
                buf[i] = Math.floor(Math.random() * 256);
            }
            let token = URLSafeBase64.encode(buf).toString();

            (async function assignToken(err) {
                if (err) {
                    return res.status(404).send({detail: 'There was a problem assigning a token!'})
                }

                await db.query('BEGIN');
                const response = await db.query({
                    text: `SELECT * FROM users WHERE email = $1`,
                    values: [email],
                });

                if (response.rows.length === 0) {
                    await db.query('ROLLBACK');
                    return res.status(404).send({detail: 'No user found!'})
                }

                await db.query({
                    text: `UPDATE users SET reset_token = $1, token_expires = $2 WHERE email = $3`,
                    values: [token, new Date(Date.now() + 3600000), email],
                });
                await db.query('COMMIT');

                const auth = {
                    auth: {
                        api_key: process.env.MAILGUN_API,
                        domain: 'mg.recipe-cloud.com'
                    }
                };

                const transporter = nodemailer.createTransport(mg(auth));

                let mailOptions = {
                    from: 'Recipe Cloud <donotreply@recipe-cloud.com>', // sender address
                    to: req.body.email, // list of receivers
                    subject: 'Password Reset', // Subject line
                    html: `You are receiving this because you (or someone else) have requested the reset of the password for your account.<br /><br />
                    Your password reset token is ${token}. Enter this token on the forgot password page to change your
                    password. Note: This token will expire after 1 hour.<br /><br />
                    If you did not request this, please ignore this email and your password will remain unchanged.` // html body
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return res.status(404).send({detail: 'There was a problem sending reset email.'})
                    } else {
                        return res.status(200).send('Success!')
                    }
                });
            })();
        })();
    }
}
import URLSafeBase64 from "urlsafe-base64";
import {prismaClient} from "../../db/index";
import {getUserIdFromRequest, sendMail} from "../../utils/serverUtils";

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

                await prismaClient.$transaction(async (tx) => {
                    const response = await tx.$queryRaw`SELECT * FROM users WHERE email = ${email};`

                    if (response.length === 0) {
                        return res.status(404).send({detail: 'No user found!'})
                    }

                    await tx.$queryRaw`UPDATE users SET reset_token = ${token}, token_expires = ${new Date(Date.now() + 3600000)} WHERE email = ${email};`
                })

                sendMail({
                    to: req.body.email, // list of receivers
                    subject: 'Password Reset', // Subject line
                    html: `You are receiving this because you (or someone else) have requested the reset of the password for your account.<br /><br />
                    Your password reset token is ${token}. Enter this token on the forgot password page to change your
                    password. Note: This token will expire after 1 hour.<br /><br />
                    If you did not request this, please ignore this email and your password will remain unchanged.` // html body
                }, (error, info) => {
                    if (error) {
                        return res.status(404).send({detail: 'There was a problem sending reset email.'})
                    } else {
                        return res.status(200).send('Success!')
                    }
                })
            })();
        })();
    }
}
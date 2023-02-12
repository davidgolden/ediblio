import db from "../../db/index";
import {encodeJWT, hashPassword} from "../../utils";

export default async function handler(req, res) {
    if (req.method === "POST") {
        // TODO this needs to use a client connection
        await db.query('BEGIN');
        const response = await db.query({
            text: `SELECT * FROM users WHERE reset_token = $1 AND token_expires > $2`,
            values: [req.body.token, new Date()]
        });

        if (response.rows.length === 0) {
            await db.query('ROLLBACK');
            return res.status(404).send('Token is invalid or has expired.')
        }

        const userToUpdate = response.rows[0];

        const userRes = await db.query({
            text: `UPDATE users SET password = $1, reset_token = NULL, token_expires = NULL WHERE id = $2 RETURNING *`,
            values: [await hashPassword(req.body.newPassword), userToUpdate.id],
        });

        await db.query('COMMIT');

        const user = userRes.rows[0];

        const jwt = await encodeJWT({
            user: {
                id: user.id,
                profile_image: user.profile_image,
                username: user.username,
            }
        });

        res.status(200).json({jwt});
    }
}
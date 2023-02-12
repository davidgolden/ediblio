import {decodeJWT, encodeJWT, usersSelector} from "../../utils";
import db from "../../db/index";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
    if (req.method === "GET") {
        try {
            const {email, password, redirect_url} = decodeJWT(req.query.jwt);

            const userRes = await db.query({
                text: `${usersSelector}
where users.email = $1
group by users.id;`, values: [email]
            });
            const user = userRes.rows[0];

            if (!user) res.status(404).send({detail: "No user found with that email!"});

            const isCorrectPassword = bcrypt.compareSync(password, user.password);

            if (!isCorrectPassword) res.status(404).send({detail: "Incorrect password!"});

            const jwt = await encodeJWT({
                user: {
                    id: user.id,
                    profile_image: user.profile_image,
                    username: user.username,
                }
            });

            res.redirect(redirect_url + '?jwt=' + jwt);

        } catch (error) {
            // TODO need to handle error
            res.redirect(500, `/_error?err=${error.message}`);
        }
    }
}
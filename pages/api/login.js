import {prismaClient} from "../../db/index";
import bcrypt from "bcryptjs";
import {encodeJWT, usersSelector} from "../../utils/serverUtils";
import {decodeJwt} from "jose";

export default async function handler(req, res) {
    if (req.method === "GET") {
        try {
            const {email, password, redirect_url} = decodeJwt(req.query.jwt);

            const users = await prismaClient.$queryRawUnsafe(`${usersSelector} where users.email = '${email}' group by users.id;`)

            const user = users[0];

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
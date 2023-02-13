import {prismaClient} from "../../db/index";
import {encodeJWT, hashPassword} from "../../utils";

export default async function handler(req, res) {
    if (req.method === "POST") {
        // TODO this needs to use a client connection
        await prismaClient.$transaction(async (tx) => {
            const response = await tx.$queryRaw`SELECT * FROM users WHERE reset_token = ${req.body.token} AND token_expires > ${new Date()};`

            if (response.length === 0) {
                return res.status(404).send('Token is invalid or has expired.')
            }

            const userToUpdate = response[0];

            const userRes = await tx.$queryRaw`UPDATE users SET password = ${await hashPassword(req.body.newPassword)}, reset_token = NULL, token_expires = NULL WHERE id = ${userToUpdate.id}::uuid RETURNING *;`

            const user = userRes[0];

            const jwt = await encodeJWT({
                user: {
                    id: user.id,
                    profile_image: user.profile_image,
                    username: user.username,
                }
            });

            res.status(200).json({jwt});
        })
    }
}
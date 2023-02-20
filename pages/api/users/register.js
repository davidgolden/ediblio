import {prismaClient} from "../../../db/index";
import {encodeJWT, hashPassword} from "../../../utils";

export default async function handler(req, res) {
    if (req.method === "POST") {
        const usersCount = await prismaClient.users.count();
        if (usersCount > 0 && !req.body.inviteToken) {
            // only the initial user is allowed to be created without an invite token
            return res.status(413).send({detail: "Not allowed"});
        } else if (req.body.inviteToken) {
            const matchingToken = await prismaClient.invite_token.findFirst({
                where: {
                    id: req.body.invite_token,
                    claimed: false,
                }
            })
            if (!matchingToken) {
                return res.status(413).send({detail: "Invalid Token"});
            } else {
                await prismaClient.invite_token.update({
                    where: {
                        id: matchingToken.id,
                    },
                    data: {
                        claimed: true,
                    }
                })
            }
        }

        const user = await prismaClient.users.create({
            data: {
                username: req.body.username,
                email: req.body.email.toLowerCase(),
                password: await hashPassword(req.body.password),
            }
        })

        const jwt = await encodeJWT({
            user: {
                id: user.id,
                profile_image: user.profile_image,
                username: user.username,
            }
        });

        res.status(200).send({jwt, user});
    }
}
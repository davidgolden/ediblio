import {prismaClient} from "../../../db/index";
import {encodeJWT, hashPassword} from "../../../utils/serverUtils";

export default async function handler(req, res) {
    if (req.method === "POST") {
        try {
            await prismaClient.$transaction(async (tx) => {
                const usersCount = await tx.users.count();
                if (usersCount > 0 && !req.body.inviteToken) {
                    // only the initial user is allowed to be created without an invite token
                    return res.status(413).send({detail: "Not allowed"});
                } else if (req.body.inviteToken) {
                    const matchingToken = await tx.invite_token.findFirst({
                        where: {
                            id: req.body.invite_token,
                            claimed: false,
                        }
                    })
                    if (!matchingToken) {
                        return res.status(413).send({detail: "Invalid Token"});
                    } else {
                        await tx.invite_token.update({
                            where: {
                                id: matchingToken.id,
                            },
                            data: {
                                claimed: true,
                            }
                        })
                    }
                }

                const user = await tx.users.create({
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
            })
        } catch (e) {
            if (e.code === "P2002") {
                // unique constraint code
                const failedFields = e.meta.target;
                res.status(500).send({detail: `The following fields are already taken: ${failedFields.join(", ")}`})
            }
            res.status(500).send({detail: e.message})
        }

    }
}
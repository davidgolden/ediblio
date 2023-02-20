import {prismaClient} from "../../db";
import {getUserIdFromRequest} from "../../utils/serverUtils";

export default async function handler(req, res) {
    if (req.method === "GET") {
        const invites = await prismaClient.invite_token.findMany();
        return res.status(200).send({invites});
    } else if (req.method === "POST") {
        const id = getUserIdFromRequest(req);

        const invite = await prismaClient.invite_token.create({
            data: {
                inviter_id: id,
                email: req.body.email,
            }
        })

        return res.status(200).send({invite});
    }
}
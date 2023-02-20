import {prismaClient} from "../../db";
import {getUserIdFromRequest} from "../../utils/serverUtils";
import {sendMail} from "../../utils/serverUtils";

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

        sendMail({
            to: req.body.email,
            subject: "Invite to Ediblio",
            html: `You have been invited to an Ediblio server - please follow <a href='${process.env.APP_URL}/register?token=${invite.id}'>this link to register</a>.`
        })

        return res.status(200).send({invite});
    }
}
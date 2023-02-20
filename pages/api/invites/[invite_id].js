import {prismaClient} from "../../../db";

export default async function handler(req, res) {
    if (req.method === "DELETE") {
        await prismaClient.invite_token.delete({
            where: {
                id: req.query.invite_id,
            }
        })
        return res.status(200).send();
    }
}
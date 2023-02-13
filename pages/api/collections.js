import {prismaClient} from "../../db/index";
import {getUserIdFromRequest, selectUserWithCollections} from "../../utils/serverUtils";

export default async function handler(req, res) {
    if (req.method === "POST") {
        const userId = getUserIdFromRequest(req);

        await prismaClient.$queryRaw`INSERT INTO collections (name, author_id) VALUES (${req.body.name}, ${userId}::uuid);`;

        const userWithCollections = await selectUserWithCollections(userId);

        return res.status(200).json({user: userWithCollections});
    }
}
import {prismaClient} from "../../../../../db/index";
import {getUserIdFromRequest} from "../../../../../utils/serverUtils";

export default async function handler(req, res) {
    if (req.method === "POST") {
        try {
            const userId = getUserIdFromRequest(req);

            await prismaClient.$queryRaw`INSERT INTO users_collections_followers (user_id, collection_id) VALUES (${userId}::uuid, ${req.query.collection_id}::uuid);`

            return res.status(200).send();
        } catch (error) {
            res.status(404).send({detail: error.message});
        }
    } else if (req.method === "DELETE") {
        try {
            const userId = getUserIdFromRequest(req);

            await prismaClient.$queryRaw`DELETE FROM users_collections_followers WHERE user_id = ${userId}::uuid AND collection_id = ${req.query.collection_id}::uuid;`

            return res.status(200).send();
        } catch (error) {
            res.status(404).send({detail: error.message});
        }
    }
}
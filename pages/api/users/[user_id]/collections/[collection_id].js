import db from "../../../../../db/index";
import {getUserIdFromRequest} from "../../../../../utils/serverUtils";

export default async function handler(req, res) {
    if (req.method === "POST") {
        try {
            const userId = getUserIdFromRequest(req);

            await db.query({
                text: `INSERT INTO users_collections_followers (user_id, collection_id) VALUES ($1, $2)`,
                values: [userId, req.query.collection_id],
            });

            return res.status(200);
        } catch (error) {
            res.status(404).send({detail: error.message});
        }
    } else if (req.method === "DELETE") {
        try {
            const userId = getUserIdFromRequest(req);

            await db.query({
                text: `DELETE FROM users_collections_followers WHERE user_id = $1 AND collection_id = $2`,
                values: [userId, req.query.collection_id],
            });

            return res.status(200);
        } catch (error) {
            res.status(404).send({detail: error.message});
        }
    }
}
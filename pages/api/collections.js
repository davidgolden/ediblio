import db from "../../db/index";
import {getUserIdFromRequest, selectUserWithCollections} from "../../utils/serverUtils";

export default async function handler(req, res) {
    if (req.method === "POST") {
        const userId = getUserIdFromRequest(req);

        await db.query({
            text: `INSERT INTO collections (name, author_id) VALUES ($1, $2)`,
            values: [req.body.name, userId],
        });

        const response = await db.query({
            text: selectUserWithCollections,
            values: [userId]
        });

        return res.status(200).json({user: response.rows[0]});
    }
}
import db from "../../../../../db/index";
import {getUserIdFromRequest} from "../../../../../utils/serverUtils";

export default async function handler(req, res) {
    if (req.method === "DELETE") {
        try {
            const userId = getUserIdFromRequest(req);

            await db.query({
                text: `DELETE FROM users_staples WHERE id = $1 AND user_id = $2`,
                values: [req.query.staple_id, userId]
            })
            res.status(200);
        } catch (error) {
            res.status(404).send({detail: error.message});
        }
    }
}
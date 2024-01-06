import {pool} from "../../../../../db/index";
import {getUserIdFromRequest} from "../../../../../utils/serverUtils";

export default async function handler(req, res) {
    if (req.method === "PATCH") {
        // edit menu item
        try {
            const userId = getUserIdFromRequest(req);
            // insert recipe into menu

            const response = await pool.query(
                `UPDATE users_recipes_menu SET date = $1 WHERE id = $2 AND user_id = $3 RETURNING *`,
                [req.body.date, req.query.menu_id, userId]
            )

            res.status(200).send(response.rows[0]);

        } catch (error) {
            res.status(404).send({detail: error.message});
        }
    }
}
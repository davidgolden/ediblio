import {getUserIdFromRequest} from "../../../../utils/serverUtils";
import {pool} from "../../../../db";

export default async function handler(req, res) {
    if (req.method === "POST") {
        // add custom menu item
        try {
            const userId = getUserIdFromRequest(req);

            const response = await pool.query(
                `INSERT INTO users_recipes_menu (user_id, name) VALUES ($1, $2) RETURNING *`,
                [userId, req.body.name]
            )

            return res.status(200).send(response.rows[0]);
        } catch (error) {
            console.error(error);
            res.status(404).send({detail: error.message});
        }
    }
}
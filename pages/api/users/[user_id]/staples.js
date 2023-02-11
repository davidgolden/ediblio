import db from "../../../../db/index";
import {getUserIdFromRequest} from "../../../../utils/serverUtils";

export default async function handler(req, res) {
    if (req.method === "GET") {
        try {
            const userId = getUserIdFromRequest(req);

            const response = await db.query({
                text: `
                    SELECT id, name, quantity, (SELECT short_name as measurement FROM measurements where id = measurement_id) 
                    FROM users_staples 
                    WHERE user_id = $1
                    `,
                values: [userId],
            })

            res.status(200).send({staples: response.rows});
        } catch (error) {
            res.status(404).send({detail: error.message});
        }
    } else if (req.method === "POST") {
        // add ingredient to grocery list
        try {
            const {name, measurement, quantity} = req.body;
            const userId = getUserIdFromRequest(req);

            const response = await db.query({
                text: `
                            INSERT INTO users_staples (user_id, name, measurement_id, quantity) 
                            VALUES ($1, $2, (SELECT id FROM measurements WHERE short_name = $3), $4)
                            RETURNING id, name, $3 as measurement, quantity
                            `,
                values: [userId, name, measurement, quantity]
            })

            return res.status(200).send(response.rows);
        } catch (error) {
            res.status(404).send({detail: error.message});
        }
    }
}
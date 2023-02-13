import {prismaClient} from "../../../../db/index";
import {getUserIdFromRequest} from "../../../../utils/serverUtils";

export default async function handler(req, res) {
    if (req.method === "GET") {
        try {
            const userId = getUserIdFromRequest(req);

            const response = await prismaClient.$queryRaw`
                    SELECT id, name, quantity, (SELECT short_name as measurement FROM measurements where id = measurement_id) 
                    FROM users_staples 
                    WHERE user_id = ${userId}::uuid;
                    `

            res.status(200).send({staples: response});
        } catch (error) {
            res.status(404).send({detail: error.message});
        }
    } else if (req.method === "POST") {
        // add ingredient to grocery list
        try {
            const {name, measurement, quantity} = req.body;
            const userId = getUserIdFromRequest(req);

            const response = await prismaClient.$queryRaw`
                            INSERT INTO users_staples (user_id, name, measurement_id, quantity) 
                            VALUES (${userId}::uuid, ${name}, (SELECT id FROM measurements WHERE short_name = ${measurement}), ${quantity})
                            RETURNING id, name, ${measurement} as measurement, quantity;
                            `

            return res.status(200).send(response);
        } catch (error) {
            res.status(404).send({detail: error.message});
        }
    }
}
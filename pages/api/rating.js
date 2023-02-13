import {prismaClient} from "../../db/index";
import {getUserIdFromRequest} from "../../utils/serverUtils";

export default async function handler(req, res) {
    if (req.method === "POST") {
        try {
            const userId = getUserIdFromRequest(req);

            await prismaClient.$transaction(async (tx) => {
                const exists = await tx.$queryRaw`SELECT * FROM ratings WHERE recipe_id = ${req.body.recipe_id}::uuid AND author_id = ${userId}::uuid;`

                // edit or create new rating
                let rating;
                if (exists.length > 0) {
                    // exists
                    rating = await tx.$queryRaw`UPDATE ratings SET rating = ${req.body.rating} WHERE id = ${exists[0].id}::uuid RETURNING *;`
                } else {
                    rating = await tx.$queryRaw`INSERT INTO ratings (recipe_id, author_id, rating) VALUES (${req.body.recipe_id}, ${userId}::uuid, ${req.body.rating}) RETURNING *;`
                }

                const average = await tx.$queryRaw`SELECT avg(rating) FROM ratings WHERE recipe_id = ${req.body.recipe_id}::uuid GROUP BY id;`

                return res.status(200).json({
                    rating: rating[0],
                    avg_rating: average[0].avg,
                });
            })

        } catch (error) {
            return res.status(404).send(error);
        }
    }
}
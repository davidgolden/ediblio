import db from "../../../db/index";
import {checkCollectionOwnership, getUserIdFromRequest} from "../../../utils/serverUtils";

const selectCollectionWithRecipes = `
SELECT collections.*,
COALESCE(json_agg(recipes) FILTER (WHERE recipes.id IS NOT NULL), '[]') recipes
FROM collections
LEFT JOIN LATERAL (
    select recipes.*, users.profile_image author_image, avg(ratings.rating) avg_rating, count(ratings) total_ratings
    from recipes
    LEFT JOIN LATERAL (
        select profile_image
        from users
        where users.id = recipes.author_id
    ) users ON True
    LEFT JOIN LATERAL (
                    select rating from ratings
                    where ratings.recipe_id = recipes.id
                ) ratings ON TRUE
    where recipes.id in (
        select recipe_id
        from recipes_collections
        where recipes_collections.collection_id = collections.id
    )
    GROUP BY recipes.id, users.profile_image
) recipes ON TRUE 
WHERE collections.id = $1
GROUP BY collections.id;`;

const selectUserWithCollections = `
        SELECT users.*,
        COALESCE(json_agg(c) FILTER (WHERE c IS NOT NULL), '[]') collections
        FROM users
        LEFT JOIN LATERAL (
            SELECT collections.*, COALESCE(json_agg(cr) FILTER (WHERE cr IS NOT NULL), '[]') recipes
                FROM collections LEFT JOIN LATERAL (
                SELECT * FROM recipes
        WHERE recipes.id IN (
            SELECT recipe_id FROM recipes_collections
            WHERE recipes_collections.collection_id = collections.id
        )
   ) cr ON true
   WHERE collections.author_id = users.id
   GROUP BY collections.id
) c ON true
WHERE users.id = $1
GROUP BY users.id;
        `;

export default async function handler(req, res) {
    if (req.method === "GET") {
        const response = await db.query({
            text: selectCollectionWithRecipes,
            values: [req.query.collection_id]
        });
        res.status(200).json({
            collection: response.rows[0],
        });
    } else if (req.method === "DELETE") {
        try {
            await checkCollectionOwnership(req, res);

            const userId = getUserIdFromRequest(req);

            const collectionRes = await db.query({
                text: `DELETE FROM collections WHERE id = $1 AND is_primary != true`,
                values: [req.query.collection_id],
            });

            if (collectionRes.rows.length > 0) {
                await db.query({
                    text: `DELETE FROM users_collections_followers WHERE collection_id = $1`,
                    values: [req.query.collection_id],
                });
            }

            const response = await db.query({
                text: selectUserWithCollections,
                values: [userId],
            });

            return res.status(200).json({user: response.rows[0]});
        } catch (error) {
            return res.status(404);
        }
    }
}
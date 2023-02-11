import db from "../../../db/index";

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

export default async function handler(req, res) {
    if (req.method === "GET") {
        const response = await db.query({
            text: selectCollectionWithRecipes,
            values: [req.query.collection_id]
        });
        res.status(200).json({
            collection: response.rows[0],
        });
    }
}
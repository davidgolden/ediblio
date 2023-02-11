import db from "../../../../db";

export default async function handler(req, res) {
    // get certain collection details about a user's collections
    if (req.method === "GET") {
        console.log("QUERY: ", req.query);
        const query = await db.query({
            text: `
        SELECT collections.*, author.profile_image author_image,
        COALESCE(json_agg(recipes.*) FILTER (WHERE recipes.id IS NOT NULL), '[]') recipes
        FROM collections
        LEFT JOIN LATERAL (
            select recipes.* from recipes
            where recipes.id in (
                select recipe_id from recipes_collections
                where recipes_collections.collection_id = collections.id
            )
        ) recipes ON TRUE 
        LEFT JOIN LATERAL (
            select profile_image from users
            where users.id = collections.author_id
        ) author ON TRUE
        WHERE collections.author_id = $1 OR collections.id IN (
            SELECT collection_id FROM users_collections_followers
            WHERE users_collections_followers.user_id = $1
        )
        group by collections.id, author.profile_image;`,
            values: [req.query.user_id],
        });
        return res.status(200).send({collections: query.rows});
    }
}
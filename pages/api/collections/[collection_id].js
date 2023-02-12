import {prismaClient} from "../../../db/index";
import {checkCollectionOwnership, getUserIdFromRequest, selectUserWithCollections} from "../../../utils/serverUtils";

export default async function handler(req, res) {
    if (req.method === "GET") {
        const collections = await prismaClient.$queryRaw`
SELECT collections.*,
COALESCE(json_agg(recipes) FILTER (WHERE recipes.id IS NOT NULL), '[]') recipes
FROM collections
LEFT JOIN LATERAL (
    select recipes.*, users.profile_image author_image, avg(ratings.rating) avg_rating, count(ratings)::text total_ratings
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
WHERE collections.id = ${req.query.collection_id}::uuid
GROUP BY collections.id;`;

        res.status(200).json({
            collection: collections[0],
        });
    } else if (req.method === "DELETE") {
        try {
            await checkCollectionOwnership(req, res);

            const userId = getUserIdFromRequest(req);

            const collections = await prismaClient.$queryRaw`DELETE FROM collections WHERE id = ${req.query.collection_id}::uuid AND is_primary != true;`;

            if (collections.length > 0) {
                await prismaClient.$queryRaw`DELETE FROM users_collections_followers WHERE collection_id = ${req.query.collection_id}::uuid;`;
            }

            const userWithCollections = await selectUserWithCollections(userId);

            return res.status(200).json({user: userWithCollections});
        } catch (error) {
            return res.status(404);
        }
    }
}
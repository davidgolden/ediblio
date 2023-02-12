import {prismaClient} from "../db";
import {decodeJWT} from "../utils";
import {addIngredient, canBeAdded} from "../client/utils/conversions";

export function getUserIdFromRequest(request) {
    try {
        // this conditional handles request coming from either API routes or middleware
        let accessToken = "";
        if (request.headers["x-access-token"]) {
            accessToken = request.headers["x-access-token"];
        } else if (request.headers.hasOwnProperty("get")) {
            accessToken = request.headers.get("x-access-token");
        }
        const decoded = decodeJWT(accessToken);
        return decoded.user.id;
    } catch (e) {
        console.error(e);
        return false;
    }
}

export async function selectUserWithCollections(userId) {
    const users = await prismaClient.$queryRaw`
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
WHERE users.id = ${userId}::uuid
GROUP BY users.id;
        `;
    return users[0];
}

export async function selectUserMenu(user_id) {
    return await prismaClient.$queryRaw`
                SELECT * FROM recipes
                WHERE recipes.id IN (
                    SELECT recipe_id FROM users_recipes_menu
                    WHERE users_recipes_menu.user_id = ${user_id}::uuid
                );`
}

export async function getRecipe(recipe_id, user_id) {
    let recipes;
    if (user_id) {
        recipes = await prismaClient.$queryRaw`
                SELECT recipes.*, COALESCE(json_agg(ingredients) FILTER (WHERE ingredients IS NOT NULL), '[]') ingredients,
                ratings.avg avg_rating, ratings.total total_ratings, avg(user_ratings.rating) user_rating, author.username author_username,
                CASE WHEN in_menu.id IS NULL THEN FALSE ELSE TRUE END AS in_menu
                FROM recipes
                LEFT JOIN LATERAL (
                    select avg(ratings.rating) avg, count(*)::text total from ratings
                    where ratings.recipe_id = recipes.id
                ) ratings ON TRUE 
                LEFT JOIN LATERAL (
                    select rating from ratings
                    where ratings.recipe_id = recipes.id
                    and ratings.author_id = ${user_id}::uuid
                ) user_ratings ON TRUE
                LEFT JOIN LATERAL (
                    SELECT recipes_ingredients.id, recipes_ingredients.quantity, recipes_ingredients.name, recipes_ingredients.measurement_id, m.short_name measurement
                    FROM recipes_ingredients
                    LEFT JOIN LATERAL (
                        SELECT short_name FROM measurements
                        WHERE measurements.id = recipes_ingredients.measurement_id
                    ) m ON true
                    WHERE recipes_ingredients.recipe_id = recipes.id
                ) ingredients ON true
                LEFT JOIN LATERAL (
                    select username
                    from users
                    where users.id = recipes.author_id
                ) author ON TRUE
                LEFT JOIN LATERAL (
                    SELECT id FROM users_recipes_menu
                    WHERE users_recipes_menu.recipe_id = recipes.id
                    AND users_recipes_menu.user_id = ${user_id}::uuid
                    LIMIT 1
                ) in_menu ON True
                WHERE recipes.id = ${recipe_id}::uuid
                group by recipes.id, author.username, in_menu.id, ratings.avg, ratings.total;`
    } else {
        recipes = await prismaClient.$queryRaw`
                SELECT recipes.*, ratings.avg avg_rating, ratings.total total_ratings, author.username author_username,
                COALESCE(json_agg(ingredients) FILTER (WHERE ingredients IS NOT NULL), '[]') ingredients
                FROM recipes
                LEFT JOIN LATERAL (
                    select avg(ratings.rating) avg, count(*)::text total from ratings
                    where ratings.recipe_id = recipes.id
                ) ratings ON TRUE 
                LEFT JOIN LATERAL (
                    SELECT recipes_ingredients.id, recipes_ingredients.quantity, recipes_ingredients.name, m.short_name measurement
                    FROM recipes_ingredients
                    LEFT JOIN LATERAL (
                        SELECT short_name FROM measurements
                        WHERE measurements.id = recipes_ingredients.measurement_id
                    ) m ON true
                    WHERE recipes_ingredients.recipe_id = recipes.id
                ) ingredients ON true
                LEFT JOIN LATERAL (
                    select username
                    from users
                    where users.id = recipes.author_id
                ) author ON TRUE
                WHERE recipes.id = ${recipe_id}::uuid
                group by recipes.id, author.username, ratings.avg, ratings.total;`;
    }
    return recipes[0];
}

export async function insertUserGroceries(user_id, ingredients) {
    const client = await db.connect();

    try {
        await client.query("BEGIN");

        for (let x = 0; x < ingredients.length; x++) {
            const ing = ingredients[x];

            // find a similar ingredient on user's grocery list
            const similarIngredient = await client.query({
                text: `
                    SELECT users_ingredients_groceries.*, measurements.short_name AS measurement
                    FROM users_ingredients_groceries
                    INNER JOIN measurements ON measurements.id = users_ingredients_groceries.measurement_id
                    WHERE (users_ingredients_groceries.name ILIKE $1
                    OR users_ingredients_groceries.name ILIKE $2
                    OR users_ingredients_groceries.name ILIKE $3
                    OR users_ingredients_groceries.name ILIKE $4
                    OR users_ingredients_groceries.name ILIKE $5)
                    AND users_ingredients_groceries.user_id = $6
                    AND deleted = false
                    LIMIT 1
                    `,
                values: [ing.name, ing.name + "s", ing.name + "es", ing.name.slice(0, -1), ing.name.slice(0, -2), user_id],
            });

            if (similarIngredient.rows.length > 0) {
                // if there's a similar ingredient
                // check if it can be added
                let m = similarIngredient.rows[0].measurement;
                let q = similarIngredient.rows[0].quantity;
                // check if item can be added
                if (canBeAdded(m, ing.measurement)) {
                    // if it can be added, add it
                    let newQM = addIngredient(Number(q), m, Number(ing.quantity), ing.measurement);

                    await client.query({
                        text: `UPDATE users_ingredients_groceries SET quantity = $1, measurement_id = (SELECT id FROM measurements WHERE short_name = $2) WHERE id = $3`,
                        values: [newQM.quantity, newQM.measurement, similarIngredient.rows[0].id],
                    });

                } else {
                    // if it can't be added, push it to grocery list
                    await client.query({
                        text: `
                            INSERT INTO users_ingredients_groceries (user_id, name, measurement_id, quantity, item_index) 
                            VALUES ($1, $2, (SELECT id FROM measurements WHERE short_name = $3), $4, (
                                SELECT count(*)
                                FROM users_ingredients_groceries ug
                                WHERE ug.user_id = $1 AND ug.deleted = false
                                )
                            )`,
                        values: [user_id, ing.name, ing.measurement, ing.quantity]
                    })
                }

            } else {
                // if there aren't any matching ingredients
                await client.query({
                    text: `
                            INSERT INTO users_ingredients_groceries (user_id, name, measurement_id, quantity, item_index) 
                            VALUES ($1, $2, (SELECT id FROM measurements WHERE short_name = $3), $4, (
                                SELECT count(*)
                                FROM users_ingredients_groceries ug
                                WHERE ug.user_id = $1 AND ug.deleted = false
                                )
                            )`,
                    values: [user_id, ing.name, ing.measurement, ing.quantity]
                })
            }
        }

        await client.query("COMMIT");

        return await selectUserGroceries(user_id);

    } catch (error) {
        await client.query("ROLLBACK");

        return error;
    } finally {
        client.release();
    }
}

export async function selectUserGroceries(user_id) {
    return await prismaClient.$queryRaw`
                SELECT g.id, g.quantity, g.name, m.short_name measurement, g.item_index
                FROM users_ingredients_groceries g
                LEFT JOIN LATERAL (
                    SELECT short_name FROM measurements
                    WHERE measurements.id = g.measurement_id
                ) m ON true
                WHERE g.user_id = ${user_id}::uuid AND g.deleted = false
                ORDER BY g.item_index;`
}

export async function checkIngredientOwnership(req, res) {
    const userId = getUserIdFromRequest(req);

    if (userId) {
        const ingredients = await prismaClient.$queryRaw`SELECT * FROM users_ingredients_groceries WHERE id = ${req.query.ingredient_id}::uuid AND user_id = ${userId}::uuid;`

        if (ingredients.length === 0) {
            res.status(403);
        }
    } else {
        res.status(403);
    }
}

export async function checkCollectionOwnership(req, res) {
    const userId = getUserIdFromRequest(req);

    if (userId) {
        const collections = await prismaClient.$queryRaw`SELECT * FROM collections WHERE id = ${req.query.collection_id}::uuid AND author_id = ${userId}::uuid;`

        if (collections.length === 0) {
            res.status(403);
        }
    } else {
        res.status(403);
    }
}

export async function checkRecipeOwnership(req, res) {
    const userId = getUserIdFromRequest(req);

    if (userId) {
        const recipes = await prismaClient.$queryRaw`SELECT * FROM recipes WHERE id = ${req.query.recipe_id}::uuid AND author_id = ${userId}::uuid;`

        if (recipes.length === 0) {
            res.status(403);
        }
    } else {
        res.status(403);
    }
}
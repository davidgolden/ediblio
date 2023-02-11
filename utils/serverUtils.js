import db from "../db";
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

export const selectUserWithCollections = `
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

export async function selectUserMenu(user_id) {
    const menu = await db.query({
        text: `
                SELECT * FROM recipes
                WHERE recipes.id IN (
                    SELECT recipe_id FROM users_recipes_menu
                    WHERE users_recipes_menu.user_id = $1
                );`,
        values: [user_id],
    });
    return menu.rows;
}

export async function getRecipe(recipe_id, user_id) {
    let response;

    if (user_id) {
        response = await db.query({
            text: `
                SELECT recipes.*, COALESCE(json_agg(ingredients) FILTER (WHERE ingredients IS NOT NULL), '[]') ingredients,
                ratings.avg avg_rating, ratings.total total_ratings, avg(user_ratings.rating) user_rating, author.username author_username,
                CASE WHEN in_menu.id IS NULL THEN FALSE ELSE TRUE END AS in_menu
                FROM recipes
                LEFT JOIN LATERAL (
                    select avg(ratings.rating) avg, count(*) total from ratings
                    where ratings.recipe_id = recipes.id
                ) ratings ON TRUE 
                LEFT JOIN LATERAL (
                    select rating from ratings
                    where ratings.recipe_id = recipes.id
                    and ratings.author_id = $1
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
                    AND users_recipes_menu.user_id = $1
                    LIMIT 1
                ) in_menu ON True
                WHERE recipes.id = $2
                group by recipes.id, author.username, in_menu.id, ratings.avg, ratings.total;`,
            values: [user_id, recipe_id]
        })
    } else {
        response = await db.query({
            text: `
                SELECT recipes.*, ratings.avg avg_rating, ratings.total total_ratings, author.username author_username,
                COALESCE(json_agg(ingredients) FILTER (WHERE ingredients IS NOT NULL), '[]') ingredients
                FROM recipes
                LEFT JOIN LATERAL (
                    select avg(ratings.rating) avg, count(*) total from ratings
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
                WHERE recipes.id = $1
                group by recipes.id, author.username, ratings.avg, ratings.total;`,
            values: [recipe_id]
        });
    }

    return response.rows[0];
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
    const groceries = await db.query({
        text: `
                SELECT g.id, g.quantity, g.name, m.short_name measurement, g.item_index
                FROM users_ingredients_groceries g
                LEFT JOIN LATERAL (
                    SELECT short_name FROM measurements
                    WHERE measurements.id = g.measurement_id
                ) m ON true
                WHERE g.user_id = $1 AND g.deleted = false
                ORDER BY g.item_index;`,
        values: [user_id],
    });
    return groceries.rows;
}
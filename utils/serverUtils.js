import db from "../db";
import {decodeJWT} from "../utils";

export function getUserIdFromRequest(request) {
    try {
        const decoded = decodeJWT(request.headers["x-access-token"]);
        return decoded.user.id;
    } catch (e) {
        return false;
    }
}

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
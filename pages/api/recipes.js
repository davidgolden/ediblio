import db from "../../db";

export default async function handler(req, res) {
    if (req.method === 'GET') {
        let page_size = req.query.page_size || 12;
        let page = req.query.page || 0;
        const skip = page * page_size;

        try {

            let text = `
            SELECT DISTINCT recipes.*, users.profile_image AS author_image, avg(ratings.rating) avg_rating, count(ratings) total_ratings
            `,
                values = [];

            if (req.user) {
                text += `, CASE WHEN in_menu.id IS NULL THEN FALSE ELSE TRUE END AS in_menu `;
                values.push(req.user.id);
            }

            text += `FROM recipes 
            INNER JOIN users ON users.id = recipes.author_id
            LEFT JOIN LATERAL (
                    select rating from ratings
                    where ratings.recipe_id = recipes.id
                ) ratings ON TRUE `;

            if (req.user) {
                text += `
                LEFT JOIN LATERAL (
                    SELECT id FROM users_recipes_menu
                    WHERE users_recipes_menu.recipe_id = recipes.id
                    AND users_recipes_menu.user_id = $1
                    LIMIT 1
                ) in_menu ON True
                `
            }

            if (req.query.author && req.query.searchTerm) {
                text += `
                    INNER JOIN recipes_ingredients ON recipes_ingredients.recipe_id = recipes.id
                    WHERE recipes.author_id = $${values.length + 1} AND (lower(recipes.name) LIKE $${values.length + 2} OR lower(recipes_ingredients.name) LIKE $${values.length + 2}) 
                    GROUP BY recipes.id, users.profile_image ${req.user ? ', in_menu.id' : ''} ORDER BY created_at desc LIMIT ${page_size} OFFSET ${skip};`;
                values.push(req.query.author, "%" + req.query.searchTerm.toLowerCase() + "%");
            } else if (req.query.author) {
                text += `
                    WHERE recipes.author_id = $${values.length + 1}  
                    GROUP BY recipes.id, users.profile_image ${req.user ? ', in_menu.id' : ''} ORDER BY created_at desc LIMIT ${page_size} OFFSET ${skip};`;
                values.push(req.query.author);
            } else if (req.query.searchTerm) {
                text += `
                    INNER JOIN recipes_ingredients ON recipes_ingredients.recipe_id = recipes.id
                    WHERE (lower(recipes.name) LIKE $${values.length + 1} OR lower(recipes_ingredients.name) LIKE $${values.length + 1}) 
                    GROUP BY recipes.id, users.profile_image ${req.user ? ', in_menu.id' : ''} ORDER BY created_at desc LIMIT ${page_size} OFFSET ${skip};`;
                values.push("%" + req.query.searchTerm.toLowerCase() + "%");
            } else {
                text += ` GROUP BY recipes.id, users.profile_image ${req.user ? ', in_menu.id' : ''} ORDER BY created_at desc LIMIT ${page_size} OFFSET ${skip};`;
            }

            const recipes = await db.query({
                text,
                values,
            });

            return res.status(200).send({recipes: recipes.rows});
        } catch (error) {
            console.log(error);
            res.status(404).send({detail: error.message});
        }
    } else {
        // Handle any other HTTP method
    }
}
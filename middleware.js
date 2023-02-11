import { NextResponse } from 'next/server'
import {verifyJWT} from "./utils";
import db from "./db/index";
import {getUserIdFromRequest} from "./utils/serverUtils";

async function isLoggedIn(request) {
    const token = request.headers.get('x-access-token');

    try {
        await verifyJWT(token);
        return true;
    } catch (e) {
        return false;
    }
}

export async function checkIngredientOwnership(req, res) {
    const userId = getUserIdFromRequest(req);

    if (userId) {
        const response = await db.query({
            text: `SELECT * FROM users_ingredients_groceries WHERE id = $1 AND user_id = $2`,
            values: [req.query.ingredient_id, userId]
        });

        if (response.rows.length === 0) {
            res.status(403);
        }
    } else {
        res.status(403);
    }
}

export async function checkCollectionOwnership(req, res) {
    const userId = getUserIdFromRequest(req);

    if (userId) {
        const response = await db.query({
            text: `SELECT * FROM collections WHERE id = $1 AND author_id = $2`,
            values: [req.query.collection_id, userId]
        });

        if (response.rows.length === 0) {
            res.status(403);
        }
    } else {
        res.status(403);
    }
}

export async function checkRecipeOwnership(req, res) {
    const userId = getUserIdFromRequest(req);

    if (userId) {
        const response = await db.query({
            text: `SELECT * FROM recipes WHERE id = $1 AND author_id = $2`,
            values: [req.query.recipe_id, userId]
        });

        if (response.rows.length === 0) {
            res.status(403);
        }
    } else {
        res.status(403);
    }
}

const authentication = [
    {
        route: /\/api\/users\/[\w-]+\/recipes/,
        methods: ["GET", "DELETE"],
        check: isLoggedIn,
    },
    {
        route: /\/api\/users\/[\w-]+/,
        methods: ["PATCH"],
        check: isLoggedIn,
    },
    {
        route: /\/api\/recipes/,
        methods: ["POST"],
        check: isLoggedIn,
    },
    {
        route: /\/api\/collections/,
        methods: ["POST"],
        check: isLoggedIn,
    },
    {
        route: /\/api\/rating/,
        methods: ["POST"],
        check: isLoggedIn,
    },
    {
        route: /\/api\/users\/[\w-]+\/ingredients/,
        methods: ["POST", "GET", "DELETE"],
        check: isLoggedIn,
    },
    {
        route: /\/api\/users\/[\w-]+\/staples/,
        methods: ["POST", "GET"],
        check: isLoggedIn,
    },
    {
        route: /\/api\/users\/[\w-]+\/staples\/[\w-]+/,
        methods: ["DELETE"],
        check: isLoggedIn,
    },
    {
        route: /\/api\/users\/[\w-]+\/ingredients\/order/,
        methods: ["POST"],
        check: isLoggedIn,
    },
    {
        route: /\/api\/users\/[\w-]+\/recipes\/[\w-]+/,
        methods: ["POST", "PATCH"],
        check: isLoggedIn,
    },
    {
        route: /\/api\/users\/[\w-]+\/collections\/[\w-]+/,
        methods: ["POST", "DELETE"],
        check: isLoggedIn,
    },
]

export async function middleware(request) {
    for (let i = 0; i < authentication.length; i++) {
        const rule = authentication[i];
        if (rule.route.exec(request.nextUrl.pathname)) {
            for (let n = 0; n < rule.methods.length; n++) {
                const method = rule.methods[n];
                if (request.method === method) {
                    const isValid = await authentication[i].check(request);
                    if (!isValid) {
                        return new NextResponse(JSON.stringify({ detail: 'You need to be logged in to do that!' }), {
                            status: 404, headers: { 'content-type': 'application/json' }
                        })
                    }
                }
            }
        }
    }
}
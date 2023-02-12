import bcrypt from "bcryptjs";
import {jwtVerify, decodeJwt, SignJWT} from "jose";

export function hashPassword(password) {
    const SALT_FACTOR = 5;

    return new Promise((res, rej) => {
        bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
            if (err) rej(err);
            bcrypt.hash(password, salt, function(err, hash) {
                if (err) rej(err);
                res(hash);
            });
        });
    });
}

export const usersSelector = `
SELECT users.*,
COALESCE(json_agg(c) FILTER (WHERE c.id IS NOT NULL), '[]') collections
FROM users
LEFT JOIN LATERAL (
    SELECT DISTINCT ON (id) collections.*, COALESCE(json_agg(cr) FILTER (WHERE cr.id IS NOT NULL), '[]') recipes
    FROM collections
    LEFT JOIN LATERAL (
        SELECT * FROM recipes
        WHERE recipes.id IN (
            SELECT recipe_id FROM recipes_collections
            WHERE recipes_collections.collection_id = collections.id
        )
    ) cr ON true
    WHERE collections.author_id = users.id
    OR collections.id IN (
        SELECT collection_id FROM users_collections_followers
        WHERE users_collections_followers.user_id = users.id
    )
    GROUP BY collections.id
) c ON true
`;

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function encodeJWT(payload) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .sign(secret)
}

export function decodeJWT(jwt) {
    return decodeJwt(jwt);
}

export async function verifyJWT(jwt) {
    return await jwtVerify(jwt, secret);
}
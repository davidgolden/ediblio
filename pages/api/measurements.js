import db from "../../db/index";

export default async function handler(req, res) {
    if (req.method === "GET") {
        const response = await db.query('SELECT * FROM measurements');

        res.status(200).send({measurements: response.rows});
    }
}
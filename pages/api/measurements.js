import {prismaClient} from "../../db/index";

export default async function handler(req, res) {
    if (req.method === "GET") {
        const response = prismaClient.$queryRaw`SELECT * from measurements;`

        res.status(200).send({measurements: response});
    }
}
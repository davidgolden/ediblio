import {prismaClient} from "../../db/index";

export default async function handler(req, res) {
    if (req.method === "GET") {
        const response = await prismaClient.measurements.findMany();

        res.status(200).send({measurements: response});
    }
}
import clientPromise from "../../lib/mongodb";
import { NextApiRequest, NextApiResponse } from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const client = await clientPromise;
        const db = client.db("sample_restaurants");
        const restaurants = await db
            .collection("restaurants")
            .find({})
            .sort({ cuisine: -1 })
            .limit(4)
            .toArray();
            res.json(restaurants);
    } catch (e) {
        console.error(e);
    }
}
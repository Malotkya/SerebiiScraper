import {headers} from "../util";

export const onRequestGet: PagesFunction<Env> = async(context) => {
    const {results, error} = await context.env.DB.prepare("SELECT * FROM Items").all();

    if(error)
        throw error;

    return Response.json(results.map(r=>r["name"]), {headers});
}
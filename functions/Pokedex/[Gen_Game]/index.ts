import { simplify, headers } from "../../util";

export const onRequestGet: PagesFunction<Env> = async(context) => {
    const gen = Number(context.params["Gen_Game"]);

    if(isNaN(gen)) {
        const name = (<string>context.params["Gen_Game"]).replace(/Version/!, "");

        const result = await context.env.DB.prepare("SELECT * FROM Pokedex WHERE id = ?")
                        .bind(simplify(name)).first();
        
        if(result === null)
            return new Response(`Unable to find game '${context.params["Gen_Game"]}'!`, {status: 404, headers});
        return new Response(<string>result["value"], {headers:{
            ...headers,
            "Content-Type": "application/json"
        }})
    }
    
    if(gen < 1 || gen > 9)
        return new Response(`Generation '${gen}' out of range!`, {status: 401, headers});

    const {results, error} = await context.env.DB.prepare(`SELECT name FROM Pokemon WHERE changes LIKE '%"${gen}"%'`)
                                .all();

    if(error)
        throw error;

    return Response.json(results.map(r=>r["name"]), {headers});
}
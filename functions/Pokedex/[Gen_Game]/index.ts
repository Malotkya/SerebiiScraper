import { simplify } from "../../util";

export const onRequestGet: PagesFunction<Env> = async(context) => {
    const gen = Number(context.params["Gen_Game"]);
    const game = simplify(<string>context.params["Gen_Game"]);

    if(isNaN(gen)) {
        return new Response("Game Pokedex is currently not supported!", {status: 401}); //TODO: Add this to API
    }
    
    if(gen < 1 || gen > 9)
        return new Response(`Generation '${gen}' out of range!`, {status: 401});

    const {results, error} = await context.env.DB.prepare(`SELECT name FROM Pokemon WHERE changes LIKE '%"${gen}"%'`)
                                .all();

    if(error)
        throw error;

    return Response.json(results.map(r=>r["name"]));
}
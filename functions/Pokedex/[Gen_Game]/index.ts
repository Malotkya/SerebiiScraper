import { simplify } from "../../util";

export const onRequestGet: PagesFunction<Env> = async(context) => {
    const gen = Number(context.params["Gen_Game"]);

    if(isNaN(gen)) {
        const game = simplify(<string>context.params["Gen_Game"]);

        const result = await context.env.DB.prepare("SELECT * FROM Pokedex WHERE id = ?")
                        .bind(game).first();
        
        if(result === null)
            return new Response(`Unable to find game '${context.params["Gen_Game"]}'!`,{status: 404} );

        return Response.json(JSON.parse(<string>result["value"]))
    }
    
    if(gen < 1 || gen > 9)
        return new Response(`Generation '${gen}' out of range!`, {status: 401});

    const {results, error} = await context.env.DB.prepare(`SELECT name FROM Pokemon WHERE changes LIKE '%"${gen}"%'`)
                                .all();

    if(error)
        throw error;

    return Response.json(results.map(r=>r["name"]));
}
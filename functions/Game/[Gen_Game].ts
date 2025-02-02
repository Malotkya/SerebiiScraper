import { simplify, headers } from "../util"

export const onRequestGet: PagesFunction<Env> = async(context) => {
    const gen  = Number(context.params["Gen_Game"])

    if(isNaN(gen)) {
        const name = (<string>context.params["Gen_Game"]).replace(/Version/!, "");
        const record = await context.env.DB.prepare("SELECT * FROM Games WHERE id = ?")
                            .bind(simplify(name)).first();

        if(record === null)
            return new Response(`Unable to find game '${context.params["Gen_Game"]}'!`, {status: 404, headers});

        record["sprite"]    = JSON.parse(<string>record["sprite"]);
        record["modifiers"] = JSON.parse(<string>record["modifiers"]);
        delete record["id"];

        return Response.json(record, {headers});
    }

    const {results, error} = await context.env.DB.prepare("SELECT * FROM Games WHERE generation = ?")
                    .bind(gen).all();

    if(error)
        throw error;

    for(const record of results){
        record["sprite"]    = JSON.parse(<string>record["sprite"]);
        record["modifiers"] = JSON.parse(<string>record["modifiers"]);
        delete record["id"]
    }

    
    return Response.json(results, {headers})
}
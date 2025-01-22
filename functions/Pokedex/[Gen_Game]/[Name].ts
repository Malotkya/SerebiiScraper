import { simplify, getUpdate } from "../../util";

async function getGeneration(value:string, DB:D1Database):Promise<number|null> {
    const num = Number(value);
    if(!isNaN(num))
        return num;

    const result = await DB.prepare("SELECT * FROM Games WHERE id = ?")
            .bind(simplify(value)).first();

    if(result === null)
        return null;

    return <number>result["generation"];
}

export const onRequestGet: PagesFunction<Env> = async(context) => {
    const gen = await getGeneration(<string>context.params["Gen_Game"], context.env.DB);
    const input = context.params["Name"];

    if(gen === null)
        return new Response(`Unable to find game '${context.params["Gen_Game"]}'!`, {status: 404});

    if(gen < 1 || gen > 9)
        return new Response(`Generation '${gen}' out of range!`, {status: 401});

    const record:Pokemon|null = await context.env.DB.prepare("SELECT * FROM Pokemon WHERE name = ?")
                    .bind(input).first();

    if(record === null)
        return new Response(`Unable to find Pokemon '${input}'!`, {status: 404});

    const changes:Record<string, Pokemon> = JSON.parse(record["changes"]!);
    delete record["changes"];

    const name     = record["name"];
    const number   = record["number"];
    const versions = JSON.parse(record["versions"]);
    const types    = JSON.parse(record["types"]);
    const abilities = getUpdate(changes, gen, "abilities") || JSON.parse(record["abilities"]);  //Error Here
    const moves     = getUpdate(changes, gen, "moves")     || JSON.parse(record["moves"]);

    return Response.json({name, number, versions, types, abilities, moves});
}
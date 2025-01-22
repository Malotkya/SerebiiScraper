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

async function queryPokemon(input:string, DB:D1Database):Promise<Pokemon|string> {
    const number = Number(input);

    if(isNaN(number)){
        const result:Pokemon|null = await DB.prepare("SELECT * FROM Pokemon WHERE simple = ?")
                    .bind(simplify(input)).first();

        if(result === null)
            return `Unable to find pokemon with name '${input}'!`;

        return result;
    }

    const result:Pokemon|null = await DB.prepare("SELECT * FROM Pokemon WHERE number = ?")
            .bind(number).first();

    if(result === null)
        return `Unable to find pokemon with number ${input}!`;

    return result;
}

export const onRequestGet: PagesFunction<Env> = async(context) => {
    const gen = await getGeneration(<string>context.params["Gen_Game"], context.env.DB);

    if(gen === null)
        return new Response(`Unable to find game '${context.params["Gen_Game"]}'!`, {status: 404});

    if(gen < 1 || gen > 9)
        return new Response(`Generation '${gen}' out of range!`, {status: 401});

    const record = await queryPokemon(<string>context.params["Name"], context.env.DB);

    if(typeof record === "string")
        return new Response(record, {status: 404});

    const changes:Record<string, Pokemon> = JSON.parse(record["changes"]!);

    if(changes[gen] === undefined)
        return new Response(`'${record["name"]}' does not exist in generation ${gen}!`, {status: 404});

    const name     = record["name"];
    const number   = record["number"];
    const versions = JSON.parse(record["versions"]);
    const types    = JSON.parse(record["types"]);
    const abilities = getUpdate(changes, gen, "abilities") || JSON.parse(record["abilities"]);  //TODO: Fix Error Here
    const moves     = getUpdate(changes, gen, "moves")     || JSON.parse(record["moves"]);

    return Response.json({name, number, versions, types, abilities, moves});
}
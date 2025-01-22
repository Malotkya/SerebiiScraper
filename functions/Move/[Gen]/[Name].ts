import { simplify, getUpdate } from "../../util";

export const onRequestGet: PagesFunction<Env> = async(context) => {
    const gen = Number(context.params["Gen"]);
    const id = simplify(<string>context.params["Name"]);

    if(isNaN(gen))
        return new Response(`Invalid Generation!'${context.params["Gen"]}'`, {status: 401});

    const value:Move|null = await context.env.DB.prepare("SELECT * FROM Moves WHERE id = ?").bind(id).first();

    if(value === null)
        return new Response(`Unable to find move '${context.params["Name"]}'!`, {status: 404});

    const changes:Record<number, Move> = JSON.parse(value["changes"]!);
    delete value["changes"];

    if(changes[gen] === undefined)
        return new Response(`Unable to find move '${context.params["Name"]}' in ${gen}!`, {status: 404});

    const name     = value["name"];
    const type     = value["type"];
    const category = getUpdate(changes, gen, "category") || value["category"];
    const pp       = getUpdate(changes, gen, "pp")       || value["pp"];
    const power    = getUpdate(changes, gen, "power")    || value["power"];
    const accuracy = getUpdate(changes, gen, "accuracy") || value["accuracy"];
    const effect   = getUpdate(changes, gen, "effect")   || value["effect"];

    return Response.json({name, category, type, pp, power, accuracy, effect});
}
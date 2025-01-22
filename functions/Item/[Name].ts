import { simplify } from "../util";

export const onRequestGet: PagesFunction<Env> = async(context) => {
    const name = simplify(<string>context.params["Name"]);

    const result = await context.env.DB.prepare("SELECT * FROM Items WHERE id = ?")
                    .bind(name).first();

    if(result === null)
        return new Response(`Unable to find '${context.params["Name"]}'`, {status: 404});

    delete result["id"];
    return Response.json(result);
}
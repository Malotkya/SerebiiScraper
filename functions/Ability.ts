export const onRequestGet: PagesFunction<Env> = async(context) => {
    const {results, error} = await context.env.DB.prepare("SELECT * FROM Abilities").all();

    if(error)
        throw error;

    const output:Record<string, string> = {};
    for(const record of results){
        output[<string>record["name"]] = <string>record["value"];
    }

    return Response.json(output);
}
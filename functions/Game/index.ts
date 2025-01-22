export const onRequestGet: PagesFunction<Env> = async(context) => {
    const {results, error} = await context.env.DB.prepare("SELECT * FROM Games").all();

    if(error)
        throw error;

    for(const record of results){
        record["sprite"]    = JSON.parse(<string>record["sprite"]);
        record["modifiers"] = JSON.parse(<string>record["modifiers"]);
        delete record["id"]
    }

    return Response.json(results);
}
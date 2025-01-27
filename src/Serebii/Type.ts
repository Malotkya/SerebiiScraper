/** Serebii Type
 * 
 * Attack & Pokemon Types
 * 
 * @author Alex Malotky
 */
import { softFind } from "../util.js";

type Type = "Bug"|"Dark"|"Dragon"|"Electric"|"Fairy"|"Fighting"|"Fire"|"Flying"|"Ghost"|"Grass"|"Ground"|"Ice"|"Normal"|"Poison"|"Psychic"|"Rock"|"Steel"|"Water"|"???";
export default Type;

//Used to find multiple types.
const TYPE_REGEX_MAP:Record<Type, RegExp> = {
    "Bug": /bug/i,
    "Dark": /dark/i,
    "Dragon": /dragon/i,
    "Electric": /electric/i,
    "Fairy": /fairy/i,
    "Fighting": /fighting/i,
    "Fire": /fire/i,
    "Flying": /flying/i,
    "Ghost": /ghost/i,
    "Grass": /grass/i,
    "Ground": /ground/i,
    "Ice": /ice/i,
    "Normal": /normal/i,
    "Poison": /poison/i,
    "Psychic": /psychic/i,
    "Rock": /rock/i,
    "Steel": /steel/i,
    "Water": /water/i,
    "???": /(curse|shadow)/i,
};

/** Get Type From String
 * 
 * @param {stirng|undefined} value 
 * @returns {Type}
 */
export function getType(value:string|undefined):Type {
    if(value === undefined)
        throw new Error("Type data is missing!");

    const match = value.toLocaleLowerCase().match(/(bug|dark|dragon|electric|fairy|fighting|fire|flying|ghost|grass|ground|ice|normal|poison|psychic|rock|steel|water)/i);

    // Return ??? for wierd early types like Shadow and Curse instead of throwning Error.
    if(match === null) {
        return "???";
    }

    return (match[0].charAt(0).toLocaleUpperCase() + match[0].slice(1)) as Type;
}

export function getAllTypes(value:string|undefined):Type[] {
    if(value === undefined)
        throw new Error("Type data is missing!");

    const output:Type[] = [];

    for(const type in TYPE_REGEX_MAP){
        if(value.match(TYPE_REGEX_MAP[<Type>type])) {
            output.push(<Type>type);
        }
    }

    if(output.length <= 0) {
        output.push("???");
    }

    return output;
}

export function getAllVersionTypes(value:string|undefined, versions:Record<string, string> = {}):Record<string, Type[]> {
    if(value === undefined)
        throw new Error("Type data is missing!");

    const list = Object.keys(versions);
    if(list.length === 0) {
        return {
            "": getAllTypes(value)
        }
    }

    const output:Record<string, Type[]> = {};
    const types:Record<string, string> = {};
    for(const line of value.split(/<\/?tr.*?>/)
                .filter(s=>!s.includes("table") && s !== "")) {
        
        const match = line.match(/<td.*?>(.*?)<\/td>/i);
        if(match === null)
            throw new Error(`Failed to match: ${line.replaceAll(/\s+/g, " ")}`);

        types[match[1]] = line;
    }

    for(const name of list){
        try {
            output[versions[name]] = getAllTypes(softFind(name, types));
        } catch (e){
            throw new Error(`There was a problem finding ${name} in:\n${value.replaceAll(/\s+/g, " ")}`);
        }
    }

    output[""] = getAllTypes(types["Normal"]);

    return output;
}
/** Serebii Type
 * 
 * Attack & Pokemon Types
 * 
 * @author Alex Malotky
 */
import { softFind } from "../util.js";
import {JSDOM} from 'jsdom';

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

export function getAllVersionTypes(value:string|undefined):Record<string, Type[]> {
    if(value === undefined)
        throw new Error("Type data is missing!");

    const {document} = new JSDOM(value).window;
    const table = document.querySelector("table");
    if(table === null){
        return {
            "Normal": getAllTypes(value)
        }
    }

    const output:Record<string, Type[]> = {};
    for(const row of table.querySelectorAll("tr")) {
        const columns = row.querySelectorAll("td");
        switch (columns.length){
            case 0:
                continue;

            case 1:
                output[columns[0].textContent!] = ["???"];
                break;

            default:
                output[columns[0].textContent!] = getAllTypes(columns[1].innerHTML)
        }
    }

    return output;
}
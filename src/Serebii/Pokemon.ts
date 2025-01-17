/** /Serebii/Pokemon
 * 
 * Serebii Pokemon Data
 * 
 * @author Alex Malotky
 */
import { RawData, fetchDom } from "../util.js";
import Type, {getAllTypes} from "./Type.js"
import { BASE_UTI, parseTable, parseList } from "./index.js";

interface Pokemon {
    name: string,
    number: number,
    version?: string,
    types: Type[],
    abilities: string[],
    moves: string[]
}
export default Pokemon;

/** Get Name
 * 
 * @param {string} value 
 * @returns {string}
 */
function getName(value:string|undefined):string {
    if(value === undefined)
        throw new Error("Missing Name data!");

    return value.trim();
}

/** Get Number
 * 
 * @param {string} value 
 * @returns {number}
 */
function getNumber(value:string|undefined):number {
    if(value === undefined)
        throw new Error("Missing Number data!");

    const match = value.match(/((?<=#)\d+|\d+)/)
    if(match === null)
        throw new Error("Failed to Parse Number!");

    return Number(match[0]);
}

/** Get Version
 * 
 * @param {string} value 
 * @returns {string}
 */
function getVersion(value:string|undefined):string|undefined {
    if(value === undefined)
        return undefined;

    const match = value.matchAll(/<a.*?title="(.*?)" .*?data-key="\d+(.*?)".*?>/gi);
    for(const group of match){
        if(group[1].toLocaleLowerCase().includes("form") && group[2] !== "")
            return group[2];
    }

    return undefined;
}

/** Get Abilities
 * 
 * @param {string} value 
 * @returns {Record<string, string>}
 */
function getAbilities(value:string|undefined):Record<string, string> {
    if(value === undefined)
        return {};

    const output:Record<string, string> = {};
    const match = value.matchAll(/<a .*?><b>(.*?)<\/b><\/a>:(.*?)(<br\/?>|$)/gi);

    for(const group of match){
        output[group[1]] = group[2];
    }

    return output;
}

/** Get Move Name From Possible HTML
 * 
 * @param {string} value 
 * @returns {string}
 */
function getMoveName(value:string):string {
    const match = value.match(/<.*?>(.*?)<\/.*?>/i);

    if(match)
        return getMoveName(match[1]);

    return value.trim();
}

/** Get Moves
 * 
 * @param {RawData[]} list 
 * @returns {string[]}
 */
function getMoves(list:RawData[]):string[] {
    const output:Set<string> = new Set();

    for(const data of list){
        const value = getMoveName(data.get("Attack Name")!);
        if(value !== "undefined" && !value.includes("!") && !value.includes("."))
            output.add(value);
    }

    return Array.from(output);
}

/** Find Move LIsts
 * 
 * @param {NodeListOf<Element>} lists 
 * @returns {RawData[]}
 */
function findMoveLists(lists:NodeListOf<Element>):RawData[] {
    let output:RawData[] = [];

    for(const list of lists) {
        try {
            let data:RawData[];
            try {
                data = parseList(list);
            } catch (e){
                throw null;
            }

            if(data.length > 0 && data[0].get("Attack Name")){
                output = output.concat(data);
            }
        } catch (e){
            if(e !== null)
                throw e;
        }
    }

    return output;
}

/** Find Sprites
 * 
 * @param {NodeListOf<Element>} list 
 * @returns {string|undefined}
 */
function findSprites(list:NodeListOf<Element>):string|undefined {
    for(const table of list) {
        try {
            let data:RawData;
            try {
                data = parseTable(table);
            } catch (e){
                throw null;
            }

            const value = data.get("Picture");

            if(value)
                return value;
        } catch (e){
            if(e !== null)
                throw e;
        }
    }

    return undefined;
}

/** Fetch Pokemon Data
 * 
 * @param {string} uri 
 * @returns {Promise<[Pokemon, Record<string, string>]>}
 */
export async function fetchPokemonData(uri:string):Promise<[Pokemon, Record<string, string>]> {
    const {document} = await fetchDom(BASE_UTI+uri);
    const tables = document.querySelectorAll("table");
    const moveData = findMoveLists(tables);
    const spriteData = findSprites(tables);

    for(const table of tables){
        let rawData:RawData;
        try {
            //Test if table is Valid
            try {
                rawData = parseTable(table);
        
                //Test if Attack Table
                if(rawData.get("Classification") === undefined)
                    throw null;
            } catch (e){
                //Throw null if table is invalid
                throw null;
            }
            
            const name    = getName(rawData.get("Name") || rawData.find("Name"));
            const number  = getNumber(rawData.get("No.") || rawData.find("No."));
            const types   = getAllTypes(rawData.get("Type") || (rawData.get("Type1")! + rawData.get("Type2")!));
            const version = getVersion(spriteData);
            const moves   = getMoves(moveData);

            const abilitiesMap = getAbilities(rawData.get("Ability") || rawData.find("Abilities"));
            const abilities = Object.keys(abilitiesMap);

            return [{name, number, version, types, abilities, moves}, abilitiesMap];
        
        } catch (e){
            //Throw any error that's not invalid table.
            if(e !== null) {
        
                //If RawData dumb debug info.
                if(rawData!)
                    rawData.debug();
        
                throw e;
            }  
        }
    }

    throw new Error("Unable to find table at: " + uri);
}
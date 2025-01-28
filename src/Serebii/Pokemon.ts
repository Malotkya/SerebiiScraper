/** /Serebii/Pokemon
 * 
 * Serebii Pokemon Data
 * 
 * @author Alex Malotky
 */
import { RawData, fetchDom, removeHTML } from "../util.js";
import Type, {getAllVersionTypes} from "./Type.js"
import { BASE_UTI, parseTable, parseList } from "./index.js";

interface Pokemon {
    name: string,
    number: number,
    versions: Record<string, string>,
    types: Record<string, Type[]>,
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

    value = removeHTML(value);

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
function getVersion(value:string|undefined):Record<string, string> {
    if(value === undefined)
        return {};

    const match = value.matchAll(/<a.*?title="(.*?)" .*?data-key="\d+(.*?)".*?>/gi);
    const output:Record<string, string> = {};
    for(const group of match){
        if(group[1].toLocaleLowerCase().includes("form") && group[2] !== "")
            output[group[1].trim().split(" ")[0]] = group[2].trim()
    }

    return output;
}

function getOrFindAbilities(value:[string, string]|undefined, tables:NodeListOf<HTMLTableElement>):Record<string, string> {
    if(value === undefined)
        value =  findAbilitiesTableData(tables);

    return getAbilities(value);
}

function findAbilitiesTableData(tables:NodeListOf<HTMLTableElement>):[string, string]|undefined{
    for(const table of tables) {
        try {
            let data:RawData;
            try {
                data = parseTable(table);
            } catch (e){
                throw null;
            }

            const value = data.find("Abilities");
            if(value)
                return value;
        } catch (e){
            if(e !== null)
                throw e;
        }
    }

    //throw new Error("Unable to find Abilities Table!");
    return undefined;
}

/** Get Abilities
 * 
 * @param {string} value 
 * @returns {Record<string, string>}
 */
function getAbilities(value:string[]|undefined):Record<string, string> {
    if(value === undefined)
        return {};

    const output:Record<string, string> = {};
    if(value[0].match(/ability:/i) !== null && value[0].indexOf("&") < 0) {
        const key = removeHTML(value[0].substring(value[0].indexOf(":")+1)).trim()
        output[key] = value[1].trim();
    } else {
        const match = value[1].matchAll(/<a .*?><b>(.*?)<\/b><\/a>:(.*?)(<br\/?>|$)/gi);

        for(const group of match){
            output[group[1]] = group[2].trim();
        }
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

    const index = value.indexOf("<");
    if(index > 0)
        value = value.substring(0, index);

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
        
        if(value !== "undefined" && !value.includes("!") && !value.includes(".") && (value !== value.toLocaleUpperCase())) //TODO test for all caps instead
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

/** Fetch Pokemon Available Generations
 * 
 * @param {string} uri 
 * @returns {Promise<string[]>}
 */
export async function fetchPokemonGenerations(uri:string):Promise<string[]> {
    const {document} = await fetchDom(BASE_UTI+uri);

    const curr = document.querySelector(".curr");
    const table = curr?.closest("table");

    if(table)
        return Array.from(table.querySelectorAll("tr")).flatMap(row=>{
            return <string[]>Array.from(row.querySelectorAll("td")).map(col=>col.querySelector("a")?.getAttribute("href")).filter(s=>s);
    });
    
    //throw new Error("Unable to find Generation Table!");
    return [uri];
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
            
            const name    = getName(rawData.get("Name") || rawData.find("Name")?.at(1));
            const number  = getNumber(rawData.get("No.") || rawData.find("No.")?.at(1));
            
            const moves   = getMoves(moveData);
            const versions = getVersion(spriteData);
            const abilitiesMap = getOrFindAbilities(rawData.find("Ability") || rawData.find("Abilities"), tables);
            
            const abilities = Object.keys(abilitiesMap);
            const types   = getAllVersionTypes(rawData.get("Type") || (rawData.get("Type1")! + rawData.get("Type2")!), versions);

            return [{name, number, versions, types, abilities, moves}, abilitiesMap];
        
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
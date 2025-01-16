/** /Serebii/Attack
 * 
 * Handles the Scrapping of Attack Data off Serebii
 * 
 * @author Alex Malotky
 */
import { fetchDom, RawData } from "../util.js";;
import Type, { getType } from "./Type.js";
import Category, {  getCategory } from "./Category.js";
import { BASE_UTI, parseTable } from "./index.js";

// URI's for Attack Data
export const ATTACK_GENERATIONS = [
    "attackdex-rby",
    "attackdex-gs",
    "attackdex",
    "attackdex-dp",
    "attackdex-bw",
    "attackdex-xy",
    "attackdex-sm",
    "attackdex-swsh",
    "attackdex-sv"
]

/** Attack Data 
 * 
 * Scraped off Serebii Page
 */
interface Attack {
    name: string,
    type: Type,
    category: Category,
    pp: number,
    power: number,
    accuracy: number,
    effect: string,
}
export default Attack;

/** Get Name From Sting
 * 
 * @param {string|undefined} value 
 * @returns {string}
 */
function getName(value:string|undefined):string {
    if(value === undefined)
        throw new Error("Name data is missing!")

    const match = value.match(/(.*?)(?=(<br\/?>)|(<!--))/);
    if(match) {
        return match[1].trim();
    }

    return value.trim();
}

/** Get Number Data From String
 * 
 * @param {string|undefined} value 
 * @param {string} name - used for errors
 * @returns {string}
 */
function getNumber(value:string|undefined, name:string):number {
    if(value === undefined){
        throw new Error(`${name} data is missing!`)
    }

    if(value.trim() === "")
        return 0;

    //Check for digits amoung html.
    const match = value.match(/\d+/);

    if(match === null)
        throw new Error(`Invalid number for ${name}: ${value}`)

    return Number(match[0]);
}

/** Get Effect Rate
 * 
 * @param {string} value 
 * @returns {number}
 */
function getEffectRate(value:string):number{
    const match = value.match(/\d+/);

    if(match === null){
        return 0;
    }

    return Number(match[0]);
}

/** Get Effect Data From Strings
 * 
 * Prefers serebii description over in game description.
 * 
 * @param {string|undefined} base - In Game Description
 * @param {string|undefined} secondary - Serebii Description
 * @param {string|undefined} rate 
 * @returns {string}
 */
function getEffect(base:string|undefined, secondary:string|undefined, rate:string|undefined):string {
    if(base === undefined){
        throw new Error("Base Effect data is missing!");
    }

    if(secondary === undefined){
        throw new Error("Secondary Effect data is missing!");
    }

    if(rate === undefined){
        throw new Error("Effect Rate data is missing!");
    }
    secondary = secondary.trim();
    if(secondary){
        const value = getEffectRate(rate);

        if(value > 0)
            return `${value}%: ${secondary}.`;

        return secondary;
    }

    return base.trim();
}

/** Fetch Attack Data
 * 
 * @param {string} uri 
 * @returns {Promise<Attack>}
 */
export async function fetchAttackData(uri:string):Promise<Attack> {
    const {document} = await fetchDom(BASE_UTI+uri);

    for(const table of document.querySelectorAll("table")) {
        let rawData:RawData;
        try {
            //Test if table is Valid
            try {
                rawData = parseTable(table);

                //Test if Attack Table
                if(rawData.get("Attack Name") === undefined)
                    throw null;
            } catch (e){
                //Throw null if table is invalid
                throw null;
            }

            const name     = getName(rawData.get("Attack Name"));
            const type     = getType(rawData.get("Battle Type"));
            const category = getCategory(rawData.get("Category"), type);
            const pp       = getNumber(rawData.get("Power Points"), "pp");
            const power    = getNumber(rawData.get("Base Power"), "power");
            const accuracy = getNumber(rawData.get("Accuracy"), "accuracy");
            const effect   = getEffect(rawData.get("Battle Effect:"), rawData.get("Secondary Effect:"), rawData.get("Effect Rate:"));

            return {name, type, category, pp, power, accuracy, effect};

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

/** Fetch List of Attacks
 * 
 * @param {string} uri 
 * @returns {Promise<[Record<string, string>, number]>} [list, length]
 */
export async function fetchAttackList(uri:string):Promise<[Record<string, string>, number]> {
    const {document} = await fetchDom(BASE_UTI+uri);
    const output:Record<string, string> = {};
    let count:number = 0;

    for(const select of document.querySelectorAll("select")){
        for(const option of select.querySelectorAll("option")){
            const name = option.textContent;

            if(name){
                if(name !== option.value) {
                    output[name.trim()] = option.value;
                    count++;
                }
                    
            }
        }
    }

    return [output, count];
}

/** Fetch Attack Data List
 * 
 * @param {string} uri
 * @returns {Promsie<Record<string, Attack>>}
 */
export async function fetchAttackDataList(uri:string):Promise<Record<string, Attack>> {
    const output:Record<string, Attack> = {};

    const [list, length] = await fetchAttackList(uri);
    let count:number = 0;
    for(const name in list) {
        process.stdout.write(`\u001b[${0}A`);

        try {
            output[name] = await fetchAttackData(list[name]);
        } catch (e:any) {
            console.error(`${name}: ${e.message || String(e)}`);
        }
        
        console.log(`${Math.ceil((count++ / length) * 100)}%`);
    }

    return output;
}

/** /Serebii/Item
 * 
 *  * Handles the Scrapping of Item Data off Serebii
 * 
 * @author Alex Malotky
 */
import { fetchDom, FileCache, RawData } from "../util.js";
import { BASE_UTI } from "./index.js";
import { parseTable } from "./index.js";

//Base URI
const ITEM_ROOT = "itemdex";

/** Fetch Item URI List
 * 
 * @returns {Promise<string[]>}
 */
export async function fetchItemsList():Promise<string[]> {
    const {document} = await fetchDom(BASE_UTI+ITEM_ROOT);

    let options:Element[] = [];
    for(const select of document.querySelectorAll("select")){
        const children = Array.from(select.children);
        const title = children.shift();

        if(title && title.textContent!.includes("ItemDex")) {
            options = options.concat(children);
        }
    }

    return options.map(element=>element.getAttribute("value") || "undefined")
        .map(string=>string.replaceAll(/[\\']/g, ""));
}

/** Get Item Name
 * 
 * @param {Document} document 
 * @returns {string}
 */
function getName(document:Document):string {
    const title = document.body.querySelector("font");

    if(title === null)
        throw new Error("Unable to find Item name!");

    return title.textContent!;
}

/** Get Data
 * 
 * @param {NodeListOf<Element>} list 
 * @param {string} name 
 * @returns {string}
 */
function getData(list:NodeListOf<Element>, name:string):string {
    for(const table of list) {
        let rawData:RawData;
        try {
            //Test if table is Valid
            try {
                rawData = parseTable(table);
            } catch (e){
                //Throw null if table is invalid
                throw null;
            }

            const value = rawData.find(name)?.at(1);

            if(value !== undefined)
                return value;

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

    throw new Error(`Unable to find Item ${name}!`);
}

/** Get Berry Effect
 * 
 * @param {string} value 
 * @returns {string}
 */
function getBerryEffect(value:string):string {
    const match = value.match(/(?<=>).*?$/);

    if(match){
        value = match[0];
    }

    value = value.replaceAll(/(opponent)|(of the opponent)|(target's)|(\(Older\))/ig, "")
                 .replaceAll(/\s+/g, " ").trim();

    if(isNaN(Number(value)) === false)
        throw new TypeError("Value is a number!");

    if(value === "")
        throw new Error("Value is Empty!");

    return value.charAt(0).toLocaleUpperCase() + value.substring(1) + ".";
}

/** Fetch Item Data
 * 
 * @param {string} uri 
 * @returns {Promise<[string, string]>}
 */
export async function fetchItemData(uri:string):Promise<[string, string]> {
    const {document} = await fetchDom(BASE_UTI+uri);
    const name = getName(document);

    let effect:string;
    try {
        effect = getData(document.querySelectorAll("table"), "Effect");
    } catch (e){
        if(!name.toLocaleLowerCase().includes("berry"))
            throw e;

        try {
            effect = getBerryEffect( getData(document.querySelectorAll("table"), "Fling") );
        } catch(e){
            effect = "A Poffin ingredient.";
        }
    }

    return [name, effect];
}

/** Fetch Item Data List
 * 
 * @returns {Promise<Record<string, string>>}
 */
export async function fetchItemDataList():Promise<Record<string, string>> {
    const cache = new FileCache();
    if(cache.has(ITEM_ROOT)) {
        process.stdout.write(`\u001b[${0}A`);
        console.log("Cached!")
        return JSON.parse(cache.get(ITEM_ROOT)!);
    }

    const output:Record<string, string> = {};
    const list = await fetchItemsList();
    let count:number = 0;
    for(const uri of list){
        process.stdout.write(`\u001b[${0}A`);

        try {
            const [name, value] = await fetchItemData(uri);
            output[name] = value;
        } catch (e:any) {
            console.error(`${uri}: ${e.message || String(e)}`);
        }

        console.log(`${Math.ceil((count++ / list.length) * 100)}%`);
    }

    cache.set(ITEM_ROOT, JSON.stringify(output));
    return output;
}
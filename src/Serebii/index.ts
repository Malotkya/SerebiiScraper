/** /Serebii
 * 
 * Generic Serebii Scrapping Functions
 */
import {RawData, fetchDom, FileCache} from "../util.js";

export const BASE_UTI = "https://www.serebii.net/";
export const NATIONAL_DEX = "pokemon/nationalpokedex.shtml";
const BREAK_REGEX = /<br ?\/?>/;


/** Parse Table Element
 * 
 * @param {Element} table 
 * @returns {RawData}
 */
export function parseTable(table:Element):RawData {
    const data = new RawData();

    //Filter out rows from sub-tables
    const rows = Array.from(table.querySelectorAll("tr")).filter(row=>row.closest("table") === table);

    while(rows.length > 0){
        const [keys, values] = parseNextTableRows(rows);

        for(let i=0; i<keys.length; i++){
            data.set(keys[i], values[i])
        }
    }

    return data;
}

/** Parse Next Table Rows
 * 
 * @param {Element[]} rows 
 * @returns {[string[], stirng[]]} [keys, values]
 */
function parseNextTableRows(rows:Element[], keys?:string[]):[string[], string[]] {
    const values:string[] = [];

    //Load keys if undefined
    if(keys === undefined) {
        keys = [];
        const first = rows.shift();

        //Return Empty Results if at the End
        if(first === undefined)
            return [[], []]

        //Return Empty Results if at the End
        if(first.childElementCount < 0)
            return [[], []];

        for(const child of first.children){
            //Check if <br> seperating data
            if(child.innerHTML.match(BREAK_REGEX)) {
                const [key, value] = child.innerHTML.split(/<br ?\/?>/);
    
                keys.push(key);
    
                //Don't add value if nothing
                if(value.trim())
                    values.push(value);
    
            //Gen 3 Pokemon Corner Case
            } else if((child.textContent && child.textContent.includes("Game Picture")) || child.querySelector("table")){
                //Skip this data.

            //Check if contians value instead of key
            } else if(child.classList.contains("fooinfo") && keys.length > 0){
                values.push(child.innerHTML);
    
            //Default: add key
            } else {
                keys.push(child.innerHTML);
            }
        }
    }
    
    //Add Values while there are none (sometimes there are empty rows)
    while(values.length === 0){

        //Break if at end
        if(rows.length === 0)
            break;

        const second = rows.shift()!;
        for(const child of second.children) {
            const testTable = child.querySelector("table")
            if( testTable !== null) {
                const testAttribute = testTable.getAttribute("border");
                if(testAttribute === null)
                    values.push(child.innerHTML)
            } else {
                values.push(child.innerHTML);
            }
        }
    }

    //Test if first row is a title row    
    if(keys.length === 1){
        if(keys[0].includes("Gender Ratio")) {
            return [keys, [values.join()]]
        }

        if(values.length > 1)
            return parseNextTableRows(rows, values);
    }

    //If more values then keys panic
    if(values.length > keys.length){
        throw new Error("More values then keys!");
    }

    //Backfill values if more keys.
    while(keys.length > values.length){
        values.push("undefined");
    }

    return [keys, values];
}

/** Parse Table List Element
 * 
 * @param {Element} list 
 * @returns {RawData[]}
 */
export function parseList(list:Element):RawData[] {
    const rows = Array.from(list.querySelectorAll("tr")).filter(row=>row.closest("table") === list);

    const header = parseNextListRows(rows);
    const output:RawData[] = [];

    while(rows.length > 0){
        const values = parseNextListRows(rows);

        if(header.length < values.length)
            throw new Error("Mismatched row from header!")

        while(values.length < header.length){
            values.push("undefined");
        }

        const data = new RawData();
        for(let i=0; i<header.length; ++i){
            data.set(header[i], values[i]);
        }

        output.push(data);
    }

    return output;
}

/** Parse Nest List Rows
 * 
 * @param {Element[]} rows 
 * @returns {string[]}
 */
function parseNextListRows(rows:Element[]):string[]{
    const next = rows.shift();

    if(next === undefined)
        return [];

    //Skip Empty and Title Rows
    if(next.childElementCount < 2)
        return parseNextListRows(rows);

    const output:string[] = [];
    
    for(let child of next.children) {
        const match = child.innerHTML.match(/<\/?table.*?>/);

        if(match === null)
            output.push(child.innerHTML);
    }

    return output;
}

/** Find Name Index
 * 
 * @param {NodeListOF<Element>} row 
 * @returns {number}
 */
function findNameIndex(row:NodeListOf<Element>):number {
    for(let index=0; index<row.length; index++){
        if(row[index].textContent?.toLowerCase().includes("name"))
            return index;
    }

    return -1;
}

/** Find Name Table
 * 
 * @param {NodeListOf<Element>} list 
 * @returns {[NodeListOf<Element>|null, number]}
 */
function findNameTable(list:NodeListOf<Element>):[Element[]|null, number]{
    for(const table of list){
        const rows = table.querySelectorAll("tr");
        if(rows.length > 0){
            const index = findNameIndex(rows[0].querySelectorAll("td"));
            if(index >= 0)
                return [Array.from(rows), index];
        }
    }

    return [null, -1];
}

/** Fetch Single Pokedex
 * 
 * @param {string} uri 
 * @returns {Promise<string[]>}
 */
export async function fetchSinglePokedex(uri:string):Promise<string[]> {
    const cache = new FileCache();
    if(cache.has(uri)) {
        return JSON.parse(cache.get(uri)!);
    }

    const {document} = await fetchDom(BASE_UTI+uri);
    const [table, index] = findNameTable(document.querySelectorAll("table"));

    if(table === null)
        throw new Error("Unable to find Table!");

    //Skip First Rows
    table.shift();
    table.shift();

    const output:string[] = [];
    while(table.length > 0){
        const row =  Array.from(table.shift()!.children).map(e=>e.textContent!);
        
        if(row.length > index) {
            const match = row[index].match(/[0-9A-Za-zÀ-ÖØ-öø-ÿ♀♂\-:.' ]+/);

            if(match){
                output.push(match[0].trim());
            }
        }
    }

    cache.set(uri, JSON.stringify(output))
    return output;
}

/** Fetch Region Pokedex
 * 
 * @param {string|string[]} uri 
 * @returns {Promise<string[]>}
 */
export async function fetchRegionPokedex(uri:string|readonly string[]):Promise<string[]> {
    if(typeof uri === "string") {
        return fetchSinglePokedex(uri);
    }

    return (await Promise.all(uri.map(fetchSinglePokedex))).flat();
}

/** Fetch National Pokedex
 * 
 * @returns {Promise<string[]>}
 */
export function fetchNationalDex():Promise<string[]> {
    return fetchSinglePokedex(NATIONAL_DEX);
}
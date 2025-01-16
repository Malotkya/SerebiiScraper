/** /Serebii
 * 
 * Generic Serebii Scrapping Functions
 */
import {RawData, fetchDom, FileCache} from "../util.js";

export const BASE_UTI = "https://www.serebii.net/";
export const NATIONAL_DEX = "/pokemon/nationalpokedex.shtml";
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
    const rows = Array.from(list.querySelectorAll("tr"));

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
        output.push(child.innerHTML);
    }

    return output;
}

export async function fetchRegionPokedex(uri:string):Promise<string[]> {
    const cache = new FileCache();
    if(cache.has(uri)) {
        return JSON.parse(cache.get(uri)!);
    }

    const {document} = await fetchDom(BASE_UTI+uri);

    const table = document.querySelector(".dextable")!;
    const rows = Array.from(table.querySelectorAll("tr"));
    const header = Array.from(rows.shift()!.children).map(e=>e.textContent!.trim());
    const index = header.indexOf("Name");

    //Skip First Row
    rows.shift();

    const output:string[] = [];
    while(rows.length > 0){
        const row =  Array.from(rows.shift()!.children).map(e=>e.textContent!);

        //Skip sub-menu rows
        if(row.length >= header.length) {
            output.push(row[index].trim());
        }
    }

    cache.set(uri, JSON.stringify(output));
    return output;
}

export function fetchNationalDex():Promise<string[]> {
    return fetchRegionPokedex(NATIONAL_DEX);
}

export async function convertNameToNumber(name:string):Promise<string> {
    const natDex = await fetchNationalDex();
    const value = natDex.indexOf(name)+1;

    if(value < 1000)
        return `00${value}`.slice(-3);

    return String(value);
}
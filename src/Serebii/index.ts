/** /Serebii
 * 
 * Generic Serebii Scrapping Functions
 */
import {RawData} from "../util.js";

export const BASE_UTI = "https://www.serebii.net/";
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
    
    //Delete first row of table for "Legends: Arceus" Data
    if(table.classList.contains("dextable")) {
        if(rows.length > 0 && rows[0].childElementCount > 0) {
            const test = rows[0].children[0];
            
            if(test.getAttribute("colspan") === "3")
                rows.shift();
        }
    }

    while(rows.length > 0){
        const [keys, values] = parseNextRows(rows);

        for(let i=0; i<keys.length; i++){
            data.set(keys[i], values[i])
        }
    }

    return data;
}

/** Parse Next Rows
 * 
 * @param {Element[]} rows 
 * @returns {[string[], stirng[]]} [keys, values]
 */
function parseNextRows(rows:Element[]):[string[], string[]] {
    const first = rows.shift();

    //Return Empty Results if at the End
    if(first === undefined)
        return [[], []]

    //Return Empty Results if at the End
    if(first.childElementCount < 0)
        return [[], []];

    const keys:string[] = [];
    const values:string[] = [];

    for(const child of first.children){
        //Check if <br> seperating data
        if(child.innerHTML.match(BREAK_REGEX)) {
            const [key, value] = child.innerHTML.split(/<br ?\/?>/);

            keys.push(key);

            //Don't add value if nothing
            if(value.trim())
                values.push(value);

        //Check if contians value instead of key
        } else if(child.classList.contains("fooinfo")){
            values.push(child.innerHTML);

        //Default: add key
        } else {
            keys.push(child.innerHTML);
        }
    }
    
    //Add Values while there are none (sometimes there are empty rows)
    while(values.length === 0){

        //Break if at end
        if(rows.length === 0)
            break;

        const second = rows.shift()!;
        for(const child of second.children) {
            values.push(child.innerHTML);
        }
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
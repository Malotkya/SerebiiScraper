import nodeFetch from "node-fetch";
import {JSDOM, DOMWindow} from 'jsdom';
import fs from "node:fs";
import path from "node:path";

/** Decoder and Queue used by fetch call.
 * 
 * Queue is nessisary because Serebii will close multiple connections opened at the same time.
 * 
 */
const queue:Array<string> = [];
const decoder = new TextDecoder("ISO-8859-1");

/** Queue Feth data
 * 
 * @param {string} url 
 * @returns {string}
 */
export async function fetch(url:string):Promise<string>{
    //Check if url is already queued.
    if(!queue.includes(url))
        queue.push(url);

    //Wait for turn.
    while(queue[0] !== url && queue.length > 0)
        await sleep();
        
    const response = await nodeFetch(url);

    //Remvoe from queue when done.
    if(queue[0] === url)
        queue.shift();

    if(!response.ok)
        throw new Error(`${url} (${response.status}) - ${response.statusText}`);

    const buffer = await response.arrayBuffer();
    return decoder.decode(buffer);
}

/** Sleep function used when waiting for result.
 * 
 * @param {number} n 
 */
export function sleep(n:number = 10) {
    return new Promise((res)=>{
        setTimeout(res, n);
    });
}

/** Simplify String
 * 
 * @param {string} value 
 * @returns {string}
 */
export function simplify(value:string):string {
    return value 
        .replaceAll(/♂/g, "M").replaceAll(/♀/g, "F")
            .split("")
            .map(c=>c.toLocaleLowerCase())
            .filter(c=>c.match(/\w/))
                .join("");
}

/** Fetch Dom 
 * 
 * Uses queue and cache.
 * 
 * @param {string} url 
 * @returns {Promise<DOMWindow>} 
 */
export async function fetchDom(url:string):Promise<DOMWindow> {
    return new JSDOM(await fetch(url)).window;
}

/** Raw Data
 * 
 * Uses a hash-like to cleanse and estimate the key value
 * to store the raw html data from scraping.
 */
export class RawData extends Map<string, string> {

    /** Clense Key
     * 
     * @param {string} value 
     * @returns {string}
     */
    private static clense(value:string):string {
        value = value.toLocaleLowerCase();
    
        while(value.match(/<\/?.*?>/gm)){
            value = value.replaceAll(/<\/?.*?>/gm, "");
        }
    
        return value.replaceAll(/\s+/g, "");
    }

    /** Get Data
     * 
     * @param {string} key 
     * @returns {string|undefined}
     */
    get(key:string) {
        return super.get(RawData.clense(key))
    }

    /** Set Data
     * 
     * @param {string} key 
     * @param {string} value 
     * @returns {this}
     */
    set(key:string, value:string) {
        return super.set(RawData.clense(key), value || "");
    }

    /** Find Data
     * 
     * @param {string} key
     * @returns {string|undefined} 
     */
    find(key:string):string|undefined{
        key = RawData.clense(key);
        for(const [name, value] of super.entries()){
            if(name.includes(key)) {
                return value;
            }
        }

        return undefined;
    }

    /** Debug Dummp
     * 
     */
    debug(){
        const data:any = {};

        for(let [key, value] of this.entries()){
            data[key] = value.replace(/\s+/g, " ");
        }

        console.debug(JSON.stringify(data, null, 2));
    }
}

/** File Cache For Storing Large Downloads.
 * 
 */
export class FileCache {
    private _location:string;

    private static clense(value:string):string {
        return value.replace(/\/|\\/g, "-")
    }

    constructor(location:string = "cache"){
        this._location = path.join(process.cwd(), location);
        if(!fs.existsSync(this._location)) {
            fs.mkdirSync(this._location), {recursive: true};
        }
    }

    set(key:string, value:string) {
        fs.writeFileSync(path.join(this._location, FileCache.clense(key)), value);
    }

    has(key:string){
        return fs.existsSync(path.join(this._location, FileCache.clense(key)));
    }

    get(key:string) {
        const filename = path.join(this._location, FileCache.clense(key));

        if(fs.existsSync(filename) === false)
            return null;

        return fs.readFileSync(filename).toString();
    }

    clear() {
        for(const key of fs.readdirSync(this._location)) {
            fs.rmSync(path.join(this._location, key))
        }
    }
}

/** Get Last Gen
 * 
 * @param {Record} value 
 * @returns {number}
 */
export function getLastGen(value:Record<number, unknown>):number {
    let max:number = -1;
    for(let gen in value){
        const num = Number(gen)
        if(num > max)
            max = num;
    }

    if(max < 0) {
        console.debug(JSON.stringify(value, null, 2));
        throw new Error("Changes was empty!");
    }

    return max;
}

/** Is Array Equal
 * 
 * @param {Array} lhs 
 * @param {Array} rhs 
 * @returns {boolean}
 */
export function arrayEqual(lhs:string[], rhs:string[]):boolean {
    if(lhs.length !== rhs.length)
        return false;

    for(const value of lhs){
        if(!rhs.includes(value))
            return false;
    }

    return true;
}

/** Remove HTML Tags from String
 * 
 * @param {string} value 
 * @returns {string}
 */
export function removeHTML(value:string):string {
    return value.replaceAll(/<[^<]*?>/g, "").trim();
}

/** Stringify Object For SQL
 * 
 * Stringifys object, escapes single quotes and wrappes string in single quotes.
 * 
 * @param {Object} value 
 * @returns {string}
 */
export function stringifyForSQL(value:Object):string {
    return `'${JSON.stringify(value).replaceAll("'", "''")}'`
}

/** Javascirpt String to SQL String
 * 
 * Removes HTML, escapes special charicaters, and wraps in single quotes.
 * 
 * @param {string} value 
 * @returns {string}
 */
export function toSQLString(value:string):string {
    return `'${removeHTML(value)
        .replaceAll(/ ?" ?/g, '"')
        .replaceAll("'", "''")
    }'`;
}
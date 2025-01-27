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
    return value.toLocaleLowerCase()
        .replaceAll("1", "one")
        .replaceAll("2", "two")
        .replaceAll("3", "three")
        .replaceAll("4", "four")
        .replaceAll("5", "five")
        .replaceAll("6", "six")
        .replaceAll("7", "seven")
        .replaceAll("8", "eight")
        .replaceAll("9", "nine")
        .replaceAll("0", "zero")
        .replaceAll(/♂/g, "M")
        .replaceAll(/♀/g, "F")
            .split("")
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
export class RawData {
    private _data:Map<string, [string, string]>;

    constructor(){
        this._data = new Map();
    }

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
    get(key:string):string|undefined{
        const value = this._data.get(RawData.clense(key));
        if(value)
            return value[1];
    }

    /** Set Data
     * 
     * @param {string} key 
     * @param {string} value 
     * @returns {this}
     */
    set(key:string, value:string):void{
        this._data.set(RawData.clense(key), [key, value]);
    }

    /** Find Data
     * 
     * @param {string} key
     * @returns {string|undefined} 
     */
    find(key:string):[string, string]|undefined{
        key = RawData.clense(key);
        for(const [name, value] of this._data.entries()){
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

        for(let [clense, [key, value]] of this._data.entries()){
            data[clense] = [key, value.replace(/\s+/g, " ")];
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

/** Is Record Equal
 * 
 * @param {Array} lhs 
 * @param {Array} rhs 
 * @returns {boolean}
 */
export function recordEqual(lhs:Record<string, unknown>, rhs:Record<string, unknown>):boolean {
    const list:string[] = Object.keys(lhs);

    if(list.length !== Object.keys(rhs).length)
        return false;

    for(const name of list){
        const leftValue = lhs[name];
        const rightValue = rhs[name];

        const type = typeof leftValue;
        if(type !== typeof rightValue)
            return false;
        
        switch(type){
            case "object":
                if(Array.isArray(leftValue)){
                    if(!Array.isArray(rightValue))
                        return false;

                    if(!arrayEqual(leftValue, rightValue))
                        return false;
                } else if( leftValue && rightValue ) {
                    if(!recordEqual(<any>leftValue, <any>rightValue))
                        return false;
                }
            break;

            case "undefined":
            break;

            case "function":
                return false;

            default:
                if(leftValue !== rightValue)
                    return false;
        }
    }

    return true;
}

/** Soft Find
 * 
 * @param {string} value 
 * @param {Record<string, any>} data 
 * @returns {any}
 */
export function softFind<T>(value:string, data:Record<string, T>):T|undefined{
    for(const name in data){
        if(name.includes(value))
            return data[name];
    }

    return undefined;
}

/** Remove HTML Tags from String
 * 
 * @param {string} value 
 * @returns {string}
 */
export function removeHTML(value:string):string {
    return value.replaceAll(/<[^<]*?>/g, "").trim();
}

/** Stringify Fix
 * 
 * Used to make stringify functions work better for my use case.
 * 
 * @param {any} value 
 * @returns {any}
 */
function stringifyFix(value:any):any {
    if(typeof value === "object") {

        if(value instanceof Map){
            const buffer:Record<any, any> = {}
            for(const [k,v] of value.entries())
                buffer[stringifyFix(k)] = stringifyFix(v);
            return buffer;

        } else if(value instanceof Set){
            return Array.from(value).map(stringifyFix);

        }else if(Array.isArray(value)){
            return value.map(stringifyFix);

        } else if(value !== null){
            const buffer:Record<string, any> = {};
            for(const name in value)
                buffer[name] = stringifyFix(value[name]);
            return buffer;
        }
    }

    return value;
}

/** Better JSON Stringify
 * 
 * Calls Stringify Fix before JSON.stringify
 * 
 * @param {any} value 
 * @returns {string}
 */
export function betterJsonStringify(value:any):string {
    return JSON.stringify(stringifyFix(value));
}

/** Stringify Object For SQL
 * 
 * Stringifys object, escapes single quotes and wrappes string in single quotes.
 * 
 * @param {Object} value 
 * @returns {string}
 */
export function stringifyForSQL(value:Object):string {
    return `'${JSON.stringify(stringifyFix(value)).replaceAll("'", "''")}'`
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
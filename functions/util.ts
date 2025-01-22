/** Simplify String
 * 
 * @param {string} value 
 * @returns {string}
 */
export function simplify(value:string):string {
    return value.split("").map(c=>c.toLocaleLowerCase()).filter(c=>c.match(/\w/)).join("");
}

/** Is Unknown Empty
 * 
 * @param {unknown} value 
 * @returns {boolean}
 */
export function isEmpty(value:unknown):boolean {
    switch(typeof value){
        case "object":
            if(Array.isArray(value)){
                return value.length === 0;
            } else if(value !== null) {
                for(const n in value)
                    return false;
            }
        case "undefined":
            return true;

        case "string":
            return value === "";

        case "function":
        case "bigint":
        case "symbol":
        case "boolean":
        case "number":
            return false;
    }
}

/** Get Next Number
 * 
 * @param {any} value 
 * @param {number} current 
 * @returns {number}
 */
function getNext(value:Record<number, any>, current:number):number {
    let next = Number.MAX_VALUE;
    for(let string in value){
        let num = Number(string);

        if(num <= current)
            continue;

        if(num < next)
            next = num;
    }

    if(next === Number.MAX_VALUE)
        return -1;

    return next;
}

function getMax(value:Record<number, any>):number {
    let max = -1;
    for(let string in value){
        let num = Number(string);

        if(num > max)
            max = num;
    }
    return max;
}

/** Get Update from Changes
 * 
 * @param {any} changes 
 * @param {number} current 
 * @param {string} name 
 * @returns {any}
 */
export function getUpdate<T, K extends keyof T>(changes:Record<number, T>, current:number, name:K):T[K]|undefined {
    if(current < 0)
        return undefined;

    const value = getUpdate(changes, getNext(changes, current), name)

    return changes[current][name] || value;
}
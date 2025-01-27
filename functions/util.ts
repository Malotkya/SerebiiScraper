/** /util
 * 
 * @author Alex Malotky
 */

export const headers = {
    'Access-Control-Allow-Origin': "*",
}

/** Simplify String
 * 
 * @param {string} value 
 * @returns {string}
 */
export function simplify(value:string):string {
    return decodeURI(value).toLocaleLowerCase()
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

/** Empty Wrapper
 * 
 * returns undefiend if the value is determined to be empty.
 * 
 * @param {any} value 
 * @returns {any|undefined}
 */
function emptyWrapper<T extends unknown>(value:T):T|undefined {
    switch(typeof value){
        case "object":
            if(Array.isArray(value)){
                if(value.length > 0)
                    return value
            } else if(value !== null) {
                for(const n in value)
                    return value;
            }
            break;

        case "string":
            if(value !== "")
                return value;
            break;

        case "function":
        case "bigint":
        case "symbol":
        case "boolean":
        case "number":
            return value;
    }

    return undefined
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

    return emptyWrapper(changes[current][name]) || value;
}
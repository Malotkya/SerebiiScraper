/** /Serebii/Generation
 * 
 * Pokemon Data By Generations
 * 
 * @author Alex Malotky
 */
export const POKEDEX_GENERATION_LIST = [
    "~",
    "pokedex",
    "pokedex-gs",
    "pokedex-rs",
    "pokedex-dp",
    "pokedex-bw",
    "pokedex-xy",
    "pokedex-sm",
    "pokedex-swsh",
    "pokedex-sv"
]

export const GENERATION_NUMBER_CAP = [
    0,
    151,
    251,
    386,
    493,
    649,
    721,
    809,
    905,
    1025
]

/** Get Generation By Number
 * 
 * @param {number} value 
 * @returns {number}
 */
export function getGenerationByNumber(value:number):number {
    
    if(value < 0)
        throw new TypeError("Pokemon Number cant't be less then Zero!");

    for(let index=1; index<GENERATION_NUMBER_CAP.length; index++) {
        if(value <= GENERATION_NUMBER_CAP[index])
            return index;
    }

    throw new TypeError("Pokemon Number out of Range!");
}

/** Get Generation By Uri
 * 
 * @param {string} value 
 * @returns {number}
 */
export function getGenerationByUri(value:string):number {
    value = value.toLocaleLowerCase();

    for(let index=POKEDEX_GENERATION_LIST.length-1; index>0; --index) {
        if(value.includes(POKEDEX_GENERATION_LIST[index]))
            return index;
    }

    throw new Error(`Unable to find Generation from '${value}'!`);
}
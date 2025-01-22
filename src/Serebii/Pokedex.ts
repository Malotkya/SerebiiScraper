/** /Serebii/Pokedex
 * 
 * @author Alex Malotky
 */
import { FileCache, fetchDom } from "../util.js";
import { BASE_UTI } from "./index.js";

type Pokedex = string|string[];
export default Pokedex;

export const NATIONAL_POKEDEX = "pokemon/nationalpokedex.shtml";

export const GEN_1_POKEDEX = "pokemon/gen1pokemon.shtml";
export const GEN_2_POKEDEX = [
    "pokemon/gen2pokemon.shtml",
    "pokemon/gen1pokemon.shtml"
];
export const GEN_3_POKEDEX = "rubysapphire/hoennpokedex.shtml";
export const GEN_4_POKEDEX = "platinum/sinnohdex.shtml";
export const GEN_5_POKEDEX = "blackwhite/unovadex.shtml";
export const GEN_5_2_POKEDEX = "black2white2/unovadex.shtml";
export const GEN_6_POKEDEX = [
    "xy/centralpokedex.shtml",
    "xy/coastalpokedex.shtml",
    "xy/mountainpokedex.shtml"
];
export const GEN_7_POKEDEX = "sunmoon/alolapokedex.shtml";
export const GEN_7_2_POKDEX = "ultrasunultramoon/alolapokedex.shtml";
export const GEN_8_POKEDEX = [
    "swordshield/galarpokedex.shtml",
    "swordshield/isleofarmordex.shtml",
    "swordshield/thecrowntundradex.shtml"
];
export const GEN_9_POKEDEX = [
    "scarletviolet/paldeapokedex.shtml",
    "scarletviolet/kitakamipokedex.shtml",
    "scarletviolet/blueberrypokedex.shtml"
]

export const FIRE_LEAF_POKEDEX = "fireredleafgreen/kantopokedex.shtml";
export const HEART_SOUL_POKEDEX = "heartgoldsoulsilver/johtodex.shtml";
export const ALPHA_OMEGA_POKEDEX = "omegarubyalphasapphire/hoenndex.shtml";
export const LEST_GO_POKEDEX = "letsgopikachueevee/kantopokedex.shtml";
export const BRILLIANT_SHINING_POKEDEX = "brilliantdiamondshiningpearl/sinnohpokedex.shtml"
export const LEGENDS_ARCEUS_POKEDEX = "legendsarceus/hisuipokedex.shtml";

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
            const match = row[index].match(/[0-9A-Za-zÀ-ÖØ-öø-ÿ♀♂\-:.' \(\)]+/);

            if(match){
                output.push(match[0].trim()
                    .replaceAll(/ ?\(M\)/gi, "♂")
                    .replaceAll(/ ?\(F\)/gi, "♀")
                );
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
export async function fetchRegionPokedex(uri:Pokedex):Promise<string[]> {
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
    return fetchSinglePokedex(NATIONAL_POKEDEX);
}
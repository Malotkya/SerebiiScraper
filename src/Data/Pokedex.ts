/** /Data/Pokedex
 * 
 * @author Alex Malotky
 */
import GameData from "./Game.js";
import {fetchRegionPokedex} from "../Serebii/Pokedex.js";
import { simplify, stringifyForSQL, toSQLString } from "../util.js";

type PokedexData = Record<string, string[]>;
export default PokedexData;

/** Fetch All Pokdex Data
 * 
 * @param {GameData} games 
 * @returns {Promise<PokedexData>}
 */
export async function fetchAllPokedexData(games:GameData):Promise<PokedexData> {
    const output:PokedexData = {};

    for(const name in games) {
        output[name] = await fetchRegionPokedex(games[name].pokedex);
    }

    return output;
}

/** Verify Pokedex Data
 * 
 * @param {PokedexData} data 
 * @param {string[]} reference 
 */
export function verifyPokedexData(data:PokedexData, reference:string[]):boolean{
    reference = reference.map(simplify);

    for(const name in data){
        for(const pokemon of data[name]){
            if(!reference.includes(simplify(pokemon))) {
                console.error(`Unknown pokemon '${pokemon}' in '${name}'!`);
                return false;
            }
        }
    }

    return true;
}

/** Generate Pokedex SQL
 * 
 * @param {PokedexData} data 
 * @returns {string}
 */
export function generatePokedexSQL(data:PokedexData):string {
    const buffer = [
        "DROP TABLE IF EXISTS Pokedex",
        `CREATE TABLE Pokedex(
            id TEXT PRIMARY KEY,
            value TEXT
        );`.replaceAll(/\s+/g, " ")
    ]

    for(const name in data){
        const id = simplify(name);
        buffer.push(`INSERT INTO Pokedex Values(
                ${toSQLString(id)},
                ${stringifyForSQL(data[name])}
        );`.replaceAll(/\s+/g, " "));
    }

    return buffer.join("\n");
}
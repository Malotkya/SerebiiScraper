/** /Data/Pokemon
 * 
 * Pokemon Data stored in Database
 * 
 * @author Alex Malotky
 */
import Pokemon from "../Serebii/Pokemon.js";
import { fetchRegionInfo, ALL_REGIONS, REGION_MAP } from "../Serebii/Region.js";
import Type from "../Serebii/Type.js";
import { getLastGen, arrayEqual } from "../util.js"
import AttackData from "./Attack.js";

interface PokemonData {
    name:string,
    number: number,
    types:Type[],
    versions: Record<string, string>, 
    abilities: string[],
    moves: string[],
    changes: Record<number, {
        abilities?: string[],
        moves?: string[]
    }>
}
export default PokemonData;

/** Create New Pokemon Data
 * 
 * @param {Pokemon} data 
 * @param {string} region 
 * @param {string} generation 
 * @returns {PokemonData}
 */
function createNew(data:Pokemon, region:string, generation:number):PokemonData {
    const versions:Record<string, string> = {};
    versions[region] = data.version || "";
    const changes:Record<number, any> = {};
    changes[generation] = {};

    return {
        ...data, versions, changes
    }
}

/** Update Pokemon Data
 * 
 * @param {PokemonData} record 
 * @param {Pokemon} data 
 * @param {string} region 
 * @param {number} generation 
 */
function update(record:PokemonData, data:Pokemon, region:string, generation:number):void {
    const last = getLastGen(record.changes);
    //Combine from Same Generation
    if(last === generation){
        const moves = new Set(record.moves.concat(data.moves));
        const abilities = new Set(record.abilities.concat(data.abilities));

        record.moves = Array.from(moves);
        record.abilities = Array.from(abilities);

    //Create Next Generation
    } else {
        record.changes[generation] = {};

        if(data.version){
            record.versions[region] = data.version;
        }

        if(!arrayEqual(record.moves, data.moves)){
            record.changes[last].moves = record.moves;
            record.moves = data.moves;
        }

        if(!arrayEqual(record.abilities, data.abilities)){
            record.changes[last].abilities = record.abilities;
            record.abilities = data.abilities;
        }
    }
}

/** Fetch All Pokemon Data
 * 
 * Gets List of Pokemon and Record of Pokemon Abilities.
 * 
 * @returns {Promise<[PokemonData[], Record<string, string>]>}
 */
export async function fetchAllPokemonData():Promise<[PokemonData[], Record<string, string>]>{
    const AllPokemon:Record<string, PokemonData> = {}
    const AllNatures:Record<string, string> = {};
    
    for(const region of ALL_REGIONS) {
        const [generation] = REGION_MAP[region];

        console.log(`Downloading ${region}\n`);

        const [pokemon, natures] = await fetchRegionInfo(region);

        //Update Natures
        for(const name in natures){
            AllNatures[name] = natures[name];
        }

        //Update Pokemon
        for(const name in pokemon){
            if(AllPokemon[name] === undefined){
                AllPokemon[name] = createNew(pokemon[name], region, generation);
            } else {
                update(AllPokemon[name], pokemon[name], region, generation);
            }
        }
    }

    return [Object.values(AllPokemon), AllNatures];
}

export function verifyPokemonData(pokemon:PokemonData[], attacks:AttackData[], abilities:string[]):boolean {
    const check:Array<string> = attacks.map(a=>a.name);

    for(let i=1; i<=pokemon.length; i++) {
        const p = pokemon[i];

        if(p.number !== i){
            console.error("Missing Pokmeon at: " + 1);
            return false;
        }

        for(const a of p.abilities) {
            if(!abilities.includes(a)) {
                console.error(`Missing Ability ${a} on ${p.name}!`);
                return false;
            }
        }

        for(const m of p.moves){
            if(!check.includes(m)) {
                console.error(`Missing Move ${m} on ${p.name}`);
                return false;
            }
        }

        for(const g in p.changes) {
            if(p.changes[g].abilities){
                for(const a of p.changes[g].abilities) {
                    if(!abilities.includes(a)) {
                        console.error(`Missing Ability ${a} at ${g} on ${p.name}!`);
                        return false;
                    }
                }
            }

            if(p.changes[g].moves){
                for(const m of p.changes[g].moves){
                    if(!check.includes(m)) {
                        console.error(`Missing Move ${m} at ${g} on ${p.name}`);
                        return false;
                    }
                }
            }
        }
    } //END FOR

    return true;
}
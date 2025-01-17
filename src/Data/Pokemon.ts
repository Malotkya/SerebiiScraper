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

interface PokemonData {
    name:string,
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
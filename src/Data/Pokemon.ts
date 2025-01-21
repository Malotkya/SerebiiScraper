/** /Data/Pokemon
 * 
 * Pokemon Data stored in Database
 * 
 * @author Alex Malotky
 */
import { fetchNationalDex } from "../Serebii/index.js";
import Pokemon, { fetchPokemonGenerations, fetchPokemonData } from "../Serebii/Pokemon.js";
import { getGenerationByNumber, getGenerationByUri, POKEDEX_GENERATION_LIST } from "../Serebii/Generation.js";
import Type from "../Serebii/Type.js";
import { getLastGen, arrayEqual, simplify, FileCache } from "../util.js"
import AttackData from "./Attack.js";
import Item from "./Item.js";

interface PokemonData {
    name:string,
    number: number,
    types:Type[],
    versions: string[], 
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
 * @param {string} generation 
 * @returns {PokemonData}
 */
function createNew(data:Pokemon, generation:number):PokemonData {
    const versions:string[] = [];
    if(data.version)
        versions.push(data.version)
    const changes:Record<number, any> = {};
    changes[generation] = {};
    
    const abilities = data.abilities.map(normalizeString);
    const moves = data.moves.map(normalizeString);

    return {
        ...data, versions, changes, abilities, moves
    }
}

/** Update Pokemon Data
 * 
 * @param {PokemonData} record 
 * @param {Pokemon} data 
 * @param {number} generation 
 */
function update(record:PokemonData, data:Pokemon, generation:number):void {
    const last = getLastGen(record.changes);

    data.abilities = data.abilities.map(normalizeString);
    data.moves = data.moves.map(normalizeString);

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
            record.versions.push(data.version);
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
    const AllPokemon:PokemonData[] = [];
    const AllAbilities:Record<string, string> = {};
    const cache = new FileCache("cache/pokemon");
    console.log("Downloading All Pokemon!\n");

    const list = await fetchNationalDex();
    for(let i=0; i<list.length; i++){
        process.stdout.write(`\u001b[${0}A`);

        if(!cache.has(list[i])){
            const number = 1+1;
            const gen = getGenerationByNumber(number);
            const queue = await fetchPokemonGenerations(
                `${POKEDEX_GENERATION_LIST[gen]}/${
                    number<1000? `00${number}`.slice(-3): number
                }.shtml`
            );
            
            //Start with first
            const [data, abilities] = await fetchPokemonData(queue.pop()!);
            const pokemon = createNew(data, gen);

            while(queue.length > 0){
                const uri = queue.pop()!;
                const gen = getGenerationByUri(uri);
                const [p, a] = await fetchPokemonData(uri);
                update(pokemon, p, gen);

                for(const name in a){
                    abilities[name] = a[name];
                }
            }

            //Save Data
            cache.set(list[i], JSON.stringify([pokemon, abilities]))

            //Update Master Lists
            for(const name in abilities){
                AllAbilities[name] = abilities[name];
            }
            AllPokemon.push(pokemon);

        //If Cached
        } else {
            const [pokemon, abilities] = JSON.parse(cache.get(list[i])!)
            for(const name in abilities){
                AllAbilities[name] = abilities[name];
            }
            AllPokemon.push(pokemon);
        }
        
         console.log(`${Math.ceil((i / list.length) * 100)}%`);
    }// END For

    return [AllPokemon, AllAbilities];
}

/** Normalize String
 * 
 * @param {string} value 
 * @returns {string}
 */
function normalizeString(value:string):string {
    const match = value.match(/^(.*?)(?=<)/);
    if(match)
        return match[0].trim();

    return value;
}

/** Verify Pokemon Data
 * 
 * @param {PokmeonData[]} pokemon 
 * @param {AttackData[]} attacks 
 * @param {string[]} abilities 
 * @returns {boolean}
 */
export function verifyPokemonData(pokemon:PokemonData[], attacks:AttackData[], abilities:string[]):boolean {
    const check:Array<string> = attacks.map(a=>simplify(a.name));

    for(let i=0; i<pokemon.length; i++) {
        const p = pokemon[i];

        if(p.number !== i+1){
            console.error("Missing Pokmeon at: " + (i+1));
            return false;
        }

        for(const a of p.abilities) {
            if(!abilities.includes(a)) {
                console.error(`Missing Ability ${a} on ${p.name}!`);
                return false;
            }
        }

        for(const m of p.moves){
            if(!check.includes(simplify(m))) {
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
                    if(!check.includes(simplify(m))) {
                        console.error(`Missing Move ${m} at ${g} on ${p.name}`);
                        return false;
                    }
                }
            }
        }
    } //END FOR

    return true;
}

/** Generate Pokemon SQL
 * 
 * @param {PokemonData} data 
 * @returns {string}
 */
export function generatePokemonSQL(data:PokemonData[]):string {
    const buffer:string[] = [`CREATE TABLE Pokemon(
        number INTEGER PRIMARY KEY,
        name: TEXT,
        types: TEXT,
        versions: TEXT,
        abilities: TEXT,
        moves: TEXT,
        changes: TEXT
    );`.replaceAll(/\s+/g, " ")];

    for(let p of data){
        buffer.push(`INSERT INTO Pokemon Values(
            ${p.number},
            "${p.name}",
            "${JSON.stringify(p.types)}",
            "${JSON.stringify(p.versions)}",
            "${JSON.stringify(p.abilities)}",
            "${JSON.stringify(p.moves)}",
            "${JSON.stringify(p.changes)}
        )`.replaceAll(/\s+/g, " "));
    }

    return buffer.join("\n");
}

/** Generate Abilities SQL
 * 
 * @param {Item[]} data 
 * @returns {string}
 */
export function generateAbilitiesSQL(data:Item[]):string {
    const buffer = [`CREATE TABLE Abilities(
        id INTEGER PRIMARY KEY,
        name: TEXT,
        value: TEXT
    );`.replaceAll(/\s+/g, " ")];

    for(const item of data){
        buffer.push(`INSERT INTO Abilities Values(
            "${item.name}",
            "${item.value}"
        )`.replaceAll(/\s+/g, " "));
    }

    return buffer.join("\n");
}
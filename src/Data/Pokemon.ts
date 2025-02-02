/** /Data/Pokemon
 * 
 * Pokemon Data stored in Database
 * 
 * @author Alex Malotky
 */
import { fetchNationalDex } from "../Serebii/Pokedex.js";
import Pokemon, { fetchPokemonGenerations, fetchPokemonData } from "../Serebii/Pokemon.js";
import { getGenerationByNumber, getGenerationByUri, POKEDEX_GENERATION_LIST } from "../Serebii/Generation.js";
import Type from "../Serebii/Type.js";
import { getLastGen, arrayEqual, recordEqual, simplify, FileCache, toSQLString, stringifyForSQL, betterJsonStringify, joinLists } from "../util.js"
import AttackData from "./Attack.js";
import Item from "./Item.js";

interface PokemonData {
    name:string,
    number: number,
    types: Record<string, Type[]>,
    versions: Record<string, string>,
    abilities: string[],
    moves: string[],
    gendered: boolean,
    changes: Record<number, {
        abilities?: string[],
        moves?: string[],
        types?: Record<string, Type[]>,
        versions?: Record<string, string>,
        gendered?: boolean
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
    const changes:Record<number, any> = {};
    changes[generation] = {};
    
    const abilities = data.abilities.map(normalizeString);
    const moves = data.moves.map(normalizeString);

    return {
        ...data, changes, abilities, moves
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

    record.changes[generation] = {};

    if(!record.gendered && data.gendered){
        record.changes[last].gendered = false;
        record.gendered = true;
    }

    if(!arrayEqual(record.moves, data.moves)){
        record.changes[last].moves = record.moves;
        record.moves = data.moves;
    }

    if(!arrayEqual(record.abilities, data.abilities)){
        record.changes[last].abilities = record.abilities;
        record.abilities = data.abilities;
    }

    if(!recordEqual(record.types, data.types)){
        record.changes[last].types = record.types;
        record.types = data.types;
    }

    if(!recordEqual(record.versions, data.versions)){
        record.changes[last].versions = record.versions;
        record.versions = data.versions;
    }
}

/** Append Additional Data
 * 
 * @param {PokemonData} current 
 * @param {PokemonData} old 
 */
function append(current:PokemonData, old:PokemonData):void {
    current.moves = joinLists(current.moves, old.moves).sort();
    for(const gen in current.changes) {
        if(current.changes[gen].moves) {
            current.changes[gen].moves =
                joinLists(current.changes[gen].moves, old.changes[gen]?.moves)
                    .sort();
        }
    }
}

function updateAbility(current:Item|undefined, name:string, value:string):Item {
    name = name.charAt(0).toLocaleUpperCase() + name.substring(1)
        .replaceAll(/( ?)([A-Z])/g, " $2")
        .replaceAll(/( [a-z])/g, "$1".toLocaleUpperCase());

    if(current){
        if(current.name.length < name.length)
            current.name = name;

        current.value = value;

        return current;
    }

    return {name, value};
}

/** Fetch Pokemon Data
 * 
 * @param {string} name 
 * @returns {Promise<[PokemonData, Record<string, string>]>}
 */
export async function fetchSinglePokemonData(name:string, number:number):Promise<[PokemonData, Record<string, string>, number[]]> {
    const cache = new FileCache("cache/pokemon");

    if(cache.has(name)) {
        return JSON.parse(cache.get(name)!);
    }

    const gen = getGenerationByNumber(number);
    const queue = await fetchPokemonGenerations(
        `${POKEDEX_GENERATION_LIST[gen]}/${
            number<1000? `00${number}`.slice(-3): number
        }.shtml`
    );
    
    //Start with first
    const [data, abilities, evos] = await fetchPokemonData(queue.pop()!);
    const pokemon = createNew(data, gen);
    const evolutions = new Set(evos);

    while(queue.length > 0){
        const uri = queue.pop()!;
        const gen = getGenerationByUri(uri);
        const [p, a, evo] = await fetchPokemonData(uri);
        update(pokemon, p, gen);

        for(const name in a){
            abilities[name] = a[name];
        }

        for(const e of evo)
            evolutions.add(e);
    }

    const evoData = Array.from(evolutions).map(n=>n-1);
    //Save Data
    cache.set(name, betterJsonStringify([pokemon, abilities, evoData]));

    return [pokemon, abilities, evoData];
}

/** Fetch All Pokemon Data
 * 
 * Gets List of Pokemon and Record of Pokemon Abilities.
 * 
 * @returns {Promise<[PokemonData[], Record<string, string>]>}
 */
export async function fetchAllPokemonData():Promise<[PokemonData[], Record<string, Item>]>{
    const AllPokemon:PokemonData[] = [];
    const AllAbilities:Record<string, Item> = {};

    const list = await fetchNationalDex();
    let gen:number = 1;
    console.log(`Downloading Generation 1:\n`);
    for(let i=0; i<list.length; i++){
        process.stdout.write(`\u001b[${0}A`);

        try {
            const [pokemon, abilities, evolutions] = await fetchSinglePokemonData(list[i], i+1);

            for(const number of evolutions){
                if(number < AllPokemon.length){
                    append(pokemon, AllPokemon[number]);
                }
            }

            AllPokemon.push(pokemon);
            for(const name in abilities){
                const id = simplify(name)
                AllAbilities[id] = updateAbility(AllAbilities[id], name, abilities[name]);
            }
        } catch (e:any){
            console.error(`${list[i]}: ${e.message || e}`)
        }

        const genTest = getGenerationByNumber(i);
        if(genTest > gen) {
            console.log(`${i-1}      \nDownloading Generation ${genTest}:`);
            gen = genTest;
        }
        
        console.log(`${i} - ${Math.round((i / list.length) * 100)}%`);
    }

    process.stdout.write(`\u001b[${0}A`);
    console.log(`${list.length-1}       `);

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
            if(!abilities.includes(simplify(a))) {
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
                    if(!abilities.includes(simplify(a))) {
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
    const buffer:string[] = [
        "DROP TABLE IF EXISTS Pokemon;",
        `CREATE TABLE Pokemon(
            number INTEGER PRIMARY KEY,
            simple TEXT,
            name TEXT,
            types TEXT,
            versions TEXT,
            abilities TEXT,
            moves TEXT,
            changes TEXT
        );`.replaceAll(/\s+/g, " ")
    ];

    for(let p of data){
        buffer.push(`INSERT INTO Pokemon Values(
            ${p.number},
            ${toSQLString(simplify(p.name))},
            ${toSQLString(p.name)},
            ${stringifyForSQL(p.types)},
            ${stringifyForSQL(p.versions)},
            ${stringifyForSQL(p.abilities)},
            ${stringifyForSQL(p.moves)},
            ${stringifyForSQL(p.changes)}
        );`.replaceAll(/\s+/g, " "));
    }

    return buffer.join("\n");
}

/** Generate Abilities SQL
 * 
 * @param { Record<string, Item>} data 
 * @returns {string}
 */
export function generateAbilitiesSQL(data: Record<string, Item>):string {
    const buffer = [
        "DROP TABLE IF EXISTS Abilities;",
        `CREATE TABLE Abilities(
            id TEXT PRIMARY KEY,
            name TEXT,
            value TEXT
        );`.replaceAll(/\s+/g, " ")
    ];

    for(const id in data){
        const item = data[id];
        buffer.push(`INSERT INTO Abilities Values(
            ${toSQLString(id)},
            ${toSQLString(item.name)},
            ${toSQLString(item.value)}
        );`.replaceAll(/\s+/g, " "));
    }

    return buffer.join("\n");
}
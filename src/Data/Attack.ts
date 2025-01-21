/** /Data/Attack
 * 
 * Attack Data as Stored in Database.
 */
import { missingAttacks } from "../fixes.js";
import Attack, { fetchAttackDataList, ATTACK_GENERATIONS } from "../Serebii/Attack.js"
import { getLastGen, simplify } from "../util.js"
import PokemonData from "./Pokemon.js";
/** Attack Data 
 * 
 * Stored in Database
 */
interface AttackData extends Attack{
    changes: Record<number, {
        pp?:number,
        power?:number,
        accuracy?:number,
        effect?: string
    }>
}
export default AttackData;

export function createNew(data:Attack, generation:number):AttackData {
    const changes:Record<number, {}> = {};
    changes[generation] = {};

    return {
        ...data,
        changes
    }
}

function update(record:AttackData, update:Attack, generation:number): void {
    const last = getLastGen(record.changes);
    record.changes[generation] = {};

    if(update.pp !== record.pp) {
        record.changes[last].pp = record.pp;
        record.pp = update.pp
    }

    if(update.power !== record.power) {
        record.changes[last].power = record.power;
        record.power = update.power
    }

    if(update.accuracy !== record.accuracy) {
        record.changes[last].accuracy = record.accuracy;
        record.accuracy = update.accuracy
    }

    if(update.effect !== record.effect) {
        record.changes[last].effect = record.effect;
        record.effect = update.effect
    }
}

/** Fetch All Attack Data
 * 
 * @returns {Promise<AttackData[]>}
 */
export async function fetchAllAttackData():Promise<AttackData[]>{
    const masterData:Record<string, AttackData> = {};

    for(let i=0; i<ATTACK_GENERATIONS.length; ++i){
        const generation = i+1;
        console.log(`Downloading Generation ${generation}\n`);

        const data = await fetchAttackDataList(ATTACK_GENERATIONS[i]);
        for(const name in data){
            const id = simplify(name);

            if(masterData[id] === undefined) {
                masterData[id] = createNew(data[name], generation);
            } else {
                update(masterData[id], data[name], generation)
            }
        }
    }

    return Object.values(masterData).concat(await missingAttacks());
}

/** Verify Attack Data
 * 
 * @param {AttackData[]} data 
 * @param {PokemonData[]} pokemon 
 * @returns {boolean}
 */
export function verifyAttackData(data: AttackData[], pokemon: PokemonData[]):boolean {
    const check:Set<string> = new Set();

    for(const p of pokemon){
        for(const m of p.moves){
            check.add(m);
        }

        for(const g in p.changes) {
            const move = p.changes[g].moves;

            if(move){
                for(const m of move)
                    check.add(m);
            }
        }
    }

    const list:string[] = data.filter(move=>{
        //Skip Shadow Type Attacks
        if(move.name.includes("Shadow") && move.type === "???")
            return false;
    
        //Skip Unique Torgue Moves
        if(move.name.includes("Torque"))
            return false;
            
        //Skip Struggle && Random move that no pokemon can learn???
        return move.name !== "Struggle" && move.name !== "Meteoric Swarm";
    }).map(a=>a.name).filter(m=>!check.has(m));

    for(const error of list){
        console.debug(error);
    }

    return list.length === 0;
}

export function generateAttackSQL(moves:AttackData[]):string {
    let buffer = `CREATE TABLE Moves(
        id INTEGER PRIMARY KEY,
        name: TEXT,
        category: TEXT,
        type: TEXT,
        pp: INTEGER,
        power: INTEGER,
        accuracy: INTEGER,
        effect: TEXT,
        changes: TEXT
    );`.replaceAll(/\s+/g, " ") + "\n";

    for(let m of moves){
        buffer += `INSERT INTO Moves Values(
            '${m.name}',
            '${m.category}'
            '${m.type}',
            ${m.pp},
            ${m.power},
            ${m.accuracy},
            "${m.effect}",
            "${m.changes}"
        );`.replaceAll(/\s+/g, " ") + "\n";
    }

    return buffer;
}
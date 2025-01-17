/** /Data/Attack
 * 
 * Attack Data as Stored in Database.
 */
import Attack, { fetchAttackDataList, ATTACK_GENERATIONS } from "../Serebii/Attack.js"
import { getLastGen } from "../util.js"
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

            if(masterData[name] === undefined) {
                const changes:Record<number, {}> = {};
                changes[generation] = {};

                masterData[name] = {
                    ...data[name],
                    changes
                }

            } else {
                const update = data[name];
                const record = masterData[name];

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
        }
    }

    return Object.values(masterData);
}
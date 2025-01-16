import Attack, { fetchAttackDataList } from "../Serebii/Attack.js"

const ATTACK_GENERATIONS = [
    "attackdex-rby",
    "attackdex-gs",
    "attackdex",
    "attackdex-dp",
    "attackdex-bw",
    "attackdex-xy",
    "attackdex-sm",
    "attackdex-swsh",
    "attackdex-sv"
]

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

function getLastGen(value:AttackData):number {
    let max:number = -1;
    for(let gen in value.changes){
        const num = Number(gen);
        if(num > max)
            //@ts-ignore
            max = num;
    }

    if(max < 0) {
        console.debug(JSON.stringify(value, null, 2));
        throw new Error("Changes was empty!");
    }
        

    return max;
}

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

                const last = getLastGen(record);
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
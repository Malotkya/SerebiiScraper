import { FileCache } from "../util.js";
import { fetchRegionPokedex, convertNameToNumber } from "./index.js";
import Pokemon, {fetchPokemonData} from "./Pokemon.js";

export const REGION_MAP = {
    "Kanto": ["/pokemon/gen1pokemon.shtml", "/pokedex"],
    "TEST": ""
} as const;

type Region = keyof typeof REGION_MAP;
export default Region;

//@ts-ignore
export const ALL_REGIONS:Region[] = Object.keys(REGION_MAP);

export async function fetchRegionInfo(r:Region):Promise<[Pokemon[], Record<string, string>]> {
    const [pokedex, uriStart] = REGION_MAP[r];
    const cache = new FileCache();

    if(cache.has(uriStart)) {
        return JSON.parse(cache.get(uriStart)!)
    }
    
    const output:Pokemon[] = [];
    const masterMap:Record<string, string> = {};
    const getUri = async(name:string) => `${uriStart}/${await convertNameToNumber(name)}.shtml`;

    const list = await fetchRegionPokedex(pokedex);
    let count = 0;
    for(let name of list){
        process.stdout.write(`\u001b[${0}A`);

        try {
            const [value, map] = await fetchPokemonData(await getUri(name));
            output.push(value);
            for(name in map){
                masterMap[name] = map[name];
            }
        } catch (e:any) {
            console.error(`${name}: ${e.message || String(e)}`);
        }

        console.log(`${Math.ceil((count++ / list.length) * 100)}%`);
    }

    cache.set(uriStart, JSON.stringify([output, masterMap]));

    return [output, masterMap];
}
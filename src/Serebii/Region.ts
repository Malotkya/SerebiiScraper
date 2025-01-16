import { BASE_UTI, fetchRegionPokedex, convertNameToNumber } from "./index.js";
import Pokemon, {fetchPokemonData} from "./Pokemon.js";

export const REGION_MAP = {
    "Kanto": ["/pokemon/gen1pokemon.shtml"],
    "TEST": ""
} as const;

type Region = keyof typeof REGION_MAP;
export default Region;

//@ts-ignore
export const ALL_REGIONS:Region[] = Object.keys(REGION_MAP);

export async function fetchRegionInfo(r:Region):Promise<[Pokemon[], Record<string, string>]> {
    const [pokedex, uriStart] = REGION_MAP[r];
    
    const output:Pokemon[] = [];
    const masterMap:Record<string, string> = {};
    const getUri = (name:string) => `${BASE_UTI+uriStart}/${convertNameToNumber(name)}.shtml`;

    const list = await fetchRegionPokedex(pokedex);
    let count = 0;
    for(let name of list){
        process.stdout.write(`\u001b[${0}A`);

        try {
            const [value, map] = await fetchPokemonData(getUri(name));
            output.push(value);
            for(name in map){
                masterMap[name] = map[name];
            }
        } catch (e:any) {
            console.error(`${name}: ${e.message || String(e)}`);
        }

        console.log(`${Math.ceil((count++ / list.length) * 100)}%`);
    }

    return [output, masterMap];
}
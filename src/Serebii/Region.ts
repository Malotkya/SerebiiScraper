/** /Serebii/Region
 * 
 * @author Alex Malotky
 */
import { FileCache } from "../util.js";
import { fetchRegionPokedex, convertNameToNumber } from "./index.js";
import Pokemon, {fetchPokemonData} from "./Pokemon.js";

// Location of All Region Info
export const REGION_MAP = {
    "Kanto":  [ 1, "/pokedex/",    "pokemon/gen1pokemon.shtml"],
    "Johto":  [ 2, "/pokedex-gs/", "pokemon/gen2pokemon.shtml"],
    "Hoenn":  [ 3, "/pokedex-rs/", "rubysapphire/hoennpokedex.shtml"],
    "Sinnoh": [ 4, "/pokedex-dp/", "platinum/sinnohdex.shtml"],
    "Unova":  [ 5, "/pokedex-bw/", "black2white2/unovadex.shtml"],
    "Kalos":  [ 6, "/pokedex-xy/", [
        "xy/centralpokedex.shtml",
        "xy/coastalpokedex.shtml",
        "xy/mountainpokedex.shtml"
    ]],
    "Alola":  [ 7, "/pokedex-sm/", "ultrasunultramoon/alolapokedex.shtml"],
    "Galar":  [ 8, "/pokedex-swsh/", [
        "swordshield/galarpokedex.shtml",
        "swordshield/isleofarmordex.shtml",
        "swordshield/thecrowntundradex.shtml"
    ]],
    "Hisui":  [ 8, "/pokedex-swsh/", "/legendsarceus/hisuipokedex.shtml"],
    "Paldea": [ 9, "/pokedex-sv/", [
        "scarletviolet/paldeapokedex.shtml",
        "scarletviolet/kitakamipokedex.shtml",
        "scarletviolet/blueberrypokedex.shtml"
    ]]
} as const;

type Region = keyof typeof REGION_MAP;
export default Region;

//@ts-ignore
export const ALL_REGIONS:Region[] = Object.keys(REGION_MAP);

export async function fetchRegionInfo(r:Region):Promise<[Record<string, Pokemon>, Record<string, string>]> {
    const [_, uriStart, pokedex] = REGION_MAP[r];
    const cache = new FileCache();

    if(cache.has(uriStart)) {
        process.stdout.write(`\u001b[${0}A`);
        console.log("Cached!");
        return JSON.parse(cache.get(uriStart)!)
    }
    
    const output:Record<string, Pokemon> = {};
    const masterMap:Record<string, string> = {};
    const getUri = async(name:string) => `${uriStart}/${await convertNameToNumber(name)}.shtml`;

    const list = await fetchRegionPokedex(pokedex);
    let count = 0;
    for(let name of list){
        process.stdout.write(`\u001b[${0}A`);

        try {
            const [value, map] = await fetchPokemonData(await getUri(name));
            output[name] = value;
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
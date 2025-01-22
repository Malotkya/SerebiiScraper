/** /Data
 * 
 * Main Data Handling Function
 */
import Game, {verifiedGameData, generateGameSQL} from "./Game.js";
import Item, {verifiedItemData, generateItemSQL} from "./Item.js";
import Pokemon, {fetchAllPokemonData, verifyPokemonData, generateAbilitiesSQL, generatePokemonSQL} from "./Pokemon.js";
import Attack, {fetchAllAttackData, verifyAttackData, generateAttackSQL} from "./Attack.js";
import Pokedex, {fetchAllPokedexData, verifyPokedexData, generatePokedexSQL} from "./Pokedex.js";
import { fetchNationalDex } from "../Serebii/Pokedex.js";
import fs from "node:fs";

interface Data {
    games:Game
    items:Item[],
    pokemon: Pokemon[],
    abilities: Item[],
    moves: Attack[]
    pokedex:Pokedex
}

/** Scrape All Data
 * 
 * @returns {Data}
 */
export async function scrapeData():Promise<Data> {
    console.log("Scrapping All Pokemon Data:");
    const [pokemon, abilityMap] = await fetchAllPokemonData();

    console.log("Extracting Ability Data:")
    const abilities = Object.keys(abilityMap).map((name)=>{ return {name, value: abilityMap[name]}});

    console.log("Scrapping All Move Data:");
    const moves = await fetchAllAttackData();

    console.log("Scrapping All Item Data:")
    const games = await verifiedGameData();
    const items = await verifiedItemData();

    console.log("Scrapping All Pokedex Data:");
    const pokedex = await fetchAllPokedexData(games);

    console.log("Verifying Pokemon Data:");
    if( verifyPokemonData(pokemon, moves, Object.keys(abilityMap)) === false) {
        fs.writeFileSync("error.json", JSON.stringify(pokemon, null, 2));
        throw new Error("Invalid Pokemon Data!");
    }
        

    console.log("Verifying Move Data:");
    if( verifyAttackData(moves, pokemon) === false) {
        fs.writeFileSync("error.json", JSON.stringify(moves, null, 2));
        throw new Error("Invalid Move Data!");
    }

    console.log("Verifying Pokedex Data:");
    if( verifyPokedexData(pokedex, await fetchNationalDex()) === false){
        fs.writeFileSync("error.json", JSON.stringify(pokedex, null, 2));
        throw new Error("Invalid Pokedex Data!");
    }

    return {pokemon, abilities, moves, games, items, pokedex}
}

/** Export All Data
 * 
 * @param {Games} games 
 * @param {Item[]} items 
 * @param {Pokemon[]} pokemon 
 * @param {Items[]} abilites 
 * @param {Attack[]} moves 
 * @returns {Promise<void>}
 */
export function exportData(games: Game, items: Item[], pokemon:Pokemon[], abilites: Item[], moves:Attack[], pokedex:Pokedex):Promise<void>{
    return new Promise((resolve, reject)=>{
        const sql:Array<string> = [];

        sql.push(generateGameSQL(games));
        sql.push(generateItemSQL(items));
        sql.push(generatePokemonSQL(pokemon));
        sql.push(generateAbilitiesSQL(abilites));
        sql.push(generateAttackSQL(moves));
        sql.push(generatePokedexSQL(pokedex));

        fs.writeFile("./data.sql", sql.join("\n"), (error)=>{

            if(error){
                reject(error);
            } else {
                resolve();
            }
        })
    });
}
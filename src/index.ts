import { scrapeData, exportData } from "./Data/index.js";

(async()=>{
    try {
        console.log("Starting!");
        const {games, items, pokemon, abilities, moves, pokedex} = await scrapeData();

        console.log("Exporting Data!");
        await exportData(games, items, pokemon, abilities, moves, pokedex);

        console.log("Complete!");
    } catch (e:any){
        console.error(e.message || String(e));
    }
    
})()
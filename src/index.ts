import { scrapeData, exportData } from "./Data/index.js";

(async()=>{
    console.log("Starting!");
    const {games, items, pokemon, abilities, moves} = await scrapeData();

    console.log("Exporting Data!");
    await exportData(games, items, pokemon, abilities, moves);

    console.log("Complete!");
})()
import { scrapeData, exportData } from "./Data/index.js";
import { fetchAllPokemonData } from "./Data/Pokemon.js";

fetchAllPokemonData().then(()=>{
    console.log("Done!");
});
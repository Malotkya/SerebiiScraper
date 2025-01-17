import { fetchAllPokemonData } from "./Data/Pokemon.js";
import fs from "fs";

fetchAllPokemonData().then(([pokemon, natures])=>{
    fs.writeFileSync("test.json", JSON.stringify(pokemon, null, 4));
    console.log(natures);
});

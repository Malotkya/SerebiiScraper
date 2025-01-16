import { fetchPokemonData } from "./Serebii/Pokemon.js";
import { fetchRegionInfo } from "./Serebii/Region.js";
import fs from "fs";

fetchRegionInfo("Kanto").then(([pokemon])=>{
    fs.writeFileSync("test.json", JSON.stringify(pokemon, null, 4))
});

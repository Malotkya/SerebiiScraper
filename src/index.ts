import { fetchAllAttackData } from "./Data/Attack.js";
import fs from "fs";

fetchAllAttackData().then(value=>{
    fs.writeFileSync("test.json", JSON.stringify(value, null, 4));
})
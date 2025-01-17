import {fetchItemDataList} from "./Serebii/Item.js";
import fs from "fs";

fetchItemDataList().then(data=>{
    fs.writeFileSync("test.json", JSON.stringify(data, null, 4))
});

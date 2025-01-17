/** /Data/Item
 * 
 * @author Alex Malotky
 */
import {fetchItemDataList} from "../Serebii/Item.js";
import {missingItems} from "../fixes.js";

interface Item {
    name: string, 
    value: string
}
export default Item;

export async function verifiedItemData():Promise<Item[]> {
    console.log("\n");
    const data = {...(await fetchItemDataList()), ...missingItems()};
    const names = Object.keys(data);
    
    return names.map((name)=>{ return {name, value: data[name]}});
}

export function generateItemSQL(data:Item[]):string {
    let buffer = `CREATE TABLE Items(
        id INTEGER PRIMARY KEY,
        name: TEXT,
        value: TEXT
    );`.replaceAll(/\s+/g, " ") + "\n";

    for(const item of data){
        buffer += `INSERT INTO Items Values(
            "${item.name}",
            "${item.value}"
        )`.replaceAll(/\s+/g, " ") + "\n";
    }

    return buffer;
}
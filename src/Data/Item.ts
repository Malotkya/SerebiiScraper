/** /Data/Item
 * 
 * @author Alex Malotky
 */
import {fetchItemDataList} from "../Serebii/Item.js";
import {missingItems} from "../fixes.js";
import { toSQLString } from "../util.js";

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
    const buffer = [
        "DROP TABLE IF EXISTS Items;",
        `CREATE TABLE Items(
            id INTEGER PRIMARY KEY,
            name TEXT,
            value TEXT
        );`.replaceAll(/\s+/g, " ")
    ];

    let id:number = 0;
    for(const item of data){
        buffer.push(`INSERT INTO Items Values(
            ${++id},
            ${toSQLString(item.name)},
            ${toSQLString(item.value)}
        );`.replaceAll(/\s+/g, " "));
    }

    return buffer.join("\n");
}
/** /Data/Item
 * 
 * @author Alex Malotky
 */
import {fetchItemDataList} from "../Serebii/Item.js";
import {missingItems} from "../fixes.js";

export default async function verifiedItemData():Promise<Record<string, string>> {
    return {
        ...(await fetchItemDataList()),
        ... missingItems()
    }
}
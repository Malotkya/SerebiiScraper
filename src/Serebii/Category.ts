/** /Serebii/Category
 * 
 * Attack Caregories
 * 
 * @author Alex Malotky
 */
import Type from "./Type.js";

type Category = "Physcial"|"Special"|"Status";
export default Category;

/** Get Category 
 * 
 * Gen 4+
 * 
 * @param {string|undefined} value 
 * @param {Type} type - For Gen 1-3
 * @returns {Category}
 */
export function getCategory(value:string|undefined, type:Type):Category {
    if(value === undefined) {
        return getOldCategory(type);
    }

    const match = value.toLocaleLowerCase().match(/(physical)|(special)|(status)|(other)/);

    if(match === null) {
        throw new Error(`Unable to get category from '${value.replace(/\s+/g, " ")}'!`)
    }

    if(match[0] === "other")
        return "Status";

    return (match[0].charAt(0).toLocaleUpperCase() + match[0].slice(1)) as Category;
}

/** Get Old Caregory
 * 
 * Gen 1-3
 * 
 * @param {Type} value 
 * @returns {Category}
 */
export function getOldCategory(value:Type):Category {
    switch(value){
        case "Fire":
        case "Water":
        case "Electric":
        case "Grass":
        case "Ice":
        case "Psychic":
        case "Dragon":
        case "Dark":
            return "Special";

        case "Normal":
        case "Fighting":
        case "Poison":
        case "Ground":
        case "Flying":
        case "Bug":
        case "Rock":
        case "Ghost":
        case "Steel":
            return "Physcial";

        case "Fairy":
        default:
            //Error
            return "Status";
    }
}
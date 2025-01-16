/** Serebii Type
 * 
 * Attack & Pokemon Types
 * 
 * @author Alex Malotky
 */
type Type = "Bug"|"Dark"|"Dragon"|"Electric"|"Fairy"|"Fighting"|"Fire"|"Flying"|"Ghost"|"Grass"|"Ground"|"Ice"|"Normal"|"Poison"|"Psychic"|"Rock"|"Steel"|"Water"|"???";
export default Type;

/** Get Type From String
 * 
 * @param {stirng|undefined} value 
 * @returns {Type}
 */
export function getType(value:string|undefined):Type {
    if(value === undefined)
        throw new Error("Type data is missing!");

    const match = value.toLocaleLowerCase().match(/(bug)|(dark)|(dragon)|(electric)|(fairy)|(fighting)|(fire)|(flying)|(ghost)|(grass)|(ground)|(ice)|(normal)|(poison)|(psychic)|(rock)|(steel)|(water)/);

    // Return ??? for wierd early types like Shadow and Curse instead of throwning Error.
    if(match === null) {
        return "???";
    }

    return (match[0].charAt(0).toLocaleUpperCase() + match[0].slice(1)) as Type;
}
/** /Serebii/Modifiers
 * 
 * Game Data (Not Worth Attempting to Scrape)
 * 
 * @author Alex Malotky
 */

type Modifier = Record<string, "string"|"number"|"boolean"|"Type">
export default Modifier;

export const GEN_ONE:Modifier   = {} as const;
export const GEN_TWO:Modifier   = {item: "string"} as const;
export const GEN_THREE:Modifier = {ability: "string", nature: "string", item: "string"} as const;
export const GEN_FOUR:Modifier  = {ability: "string", nature: "string", item: "string"} as const;
export const GEN_FIVE:Modifier  = {ability: "string", nature: "string", item: "string"} as const;
export const GEN_SIX:Modifier   = {ability: "string", nature: "string", item: "string"} as const;
export const GEN_SEVEN:Modifier = {ability: "string", nature: "string", item: "string"} as const;
export const LIMITED:Modifier   = {nature: "string"} as const;
export const GEN_EIGHT:Modifier = {
    ability: "string",
    nature: "string",
    item: "string",
    dynamax: "number",
    gigantimax: "boolean"
} as const;
export const GEN_NINE:Modifier = {
    ability: "string",
    nature: "string",
    item: "string",
    terraType: "Type"
} as const;
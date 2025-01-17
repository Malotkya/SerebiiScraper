/** /Serebii/Sprite
 * 
 * Game Data (Not Worth Attempting to Scrape)
 * 
 * @author Alex Malotky
 */

interface Sprite {
    normal:string,
    shiney?:string
    ext?: string //Default .png
}
export default Sprite;

//Generation 1
export const GREEN_SPRITE:Sprite = {normal: "pokearth/sprites/green"};
export const RED_BLUE_SPRITES:Sprite = {normal: "pokearth/sprites/rb"};
export const YELLOW_SPRITES:Sprite = {normal: "pokearth/sprites/yellow"};

//Generation 2
export const GOLD_SPRITE:Sprite = {
    normal: "pokearth/sprites/gold",
    shiney: 'Shiny/Gold'
};
export const SILVER_SPRITE:Sprite = {
    normal: "pokearth/sprites/silver",
    shiney: "Shiny/Silver"
};
export const CRYSTAL_SPRITE:Sprite = {
    normal: "pokearth/sprites/crystal",
    shiney: "Shiny/Crystal"
}

//Generation 3
export const GEN_THREE_SPRITE:Sprite = {
    normal: "emerald/pokemon",
    shiney: "Shiny/Em"
}
export const GEN_THREE_REMAKE_SPRITE:Sprite = {
    normal: "red_green/pokemon",
    shiney: "Shiny/FRLG",
    ext: ".gif"
}

//Generation 4
export const GEN_FOUR_SPRITE:Sprite = {
    normal: "pokearth/sprites/dp",
    shiney: "Shiny/DP"
}
export const GEN_FOUR_REMAKE_SPRITE:Sprite = {
    normal: "pokearth/sprites/hgss",
    shiney: "Shiny/HGSS"
}

//Generation 5
export const GEN_FIVE_SPRITE:Sprite = {
    normal: "blackwhite/pokemon",
    shiney: "Shiny/BW"
}

//Generation 6
export const GEN_SIX_SPRITE:Sprite = {
    normal: "xy/pokemon",
    shiney: "Shiny/XY"
}

//Generation 7
export const GEN_SEVEN_SPRITE:Sprite = {
    normal: "sunmoon/pokemon",
    shiney: "Shiny/SM"
}
export const LETS_GO_SPRITES:Sprite = {
    normal: "letsgopikachueevee/pokemon",
    shiney: "Shiny/SM"
}

//Generation 8
export const GEN_EIGHT_SPRITE:Sprite = {
    normal: "swordshield/pokemon",
    shiney: "Shiny/SWSH"
}

//Generation 9
export const GEN_NINE_SPRITE:Sprite = {
    normal: "scarletviolet/pokemon/new",
    shiney: "Shiny/SV/new"
}
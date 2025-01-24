/** /Serebii/Game
 * 
 * Game Data (Not Worth Attempting to Scrape)
 * 
 * @author Alex Malotky
 */

import Modifier, { GEN_EIGHT, GEN_FIVE, GEN_FOUR, GEN_NINE, GEN_ONE, GEN_SEVEN, GEN_SIX, GEN_THREE, GEN_TWO, LIMITED } from "./Modifiers.js"
import Pokedex, { FIRE_LEAF_POKEDEX, GEN_1_POKEDEX, GEN_2_POKEDEX, GEN_3_POKEDEX, GEN_4_POKEDEX, GEN_5_2_POKEDEX, GEN_5_POKEDEX, HEART_SOUL_POKEDEX, GEN_6_POKEDEX, ALPHA_OMEGA_POKEDEX, GEN_7_POKEDEX, GEN_7_2_POKDEX, LEST_GO_POKEDEX, GEN_8_POKEDEX, BRILLIANT_SHINING_POKEDEX, LEGENDS_ARCEUS_POKEDEX, GEN_9_POKEDEX } from "./Pokedex.js";
import Sprite, { CRYSTAL_SPRITE, GEN_EIGHT_SPRITE, GEN_FIVE_SPRITE, GEN_FOUR_REMAKE_SPRITE, GEN_FOUR_SPRITE, GEN_NINE_SPRITE, GEN_SEVEN_SPRITE, GEN_SIX_SPRITE, GEN_THREE_REMAKE_SPRITE, GEN_THREE_SPRITE, GOLD_SPRITE, GREEN_SPRITE, LETS_GO_SPRITES, RED_BLUE_SPRITES, SILVER_SPRITE, YELLOW_SPRITES } from "./Sprite.js"

interface Game {
    name:string
    sprite: Sprite
    generation: number
    modifiers: Modifier
    region: string
    pokedex: Pokedex
}
export default Game;

//Generation 1
export const Green:Game = {
    name: "Green Version",
    sprite: GREEN_SPRITE,
    generation: 1,
    region: "Kanto",
    modifiers: GEN_ONE,
    pokedex: GEN_1_POKEDEX
};
export const Red:Game = {
    name: "Red Version",
    sprite: RED_BLUE_SPRITES,
    generation: 1,
    region: "Kanto",
    modifiers: GEN_ONE,
    pokedex: GEN_1_POKEDEX
}
export const Blue:Game = {
    name: "Blue Version",
    sprite: RED_BLUE_SPRITES,
    generation: 1,
    region: "Kanto",
    modifiers: GEN_ONE,
    pokedex: GEN_1_POKEDEX
}
export const Yellow:Game = {
    name: "Yellow Version",
    sprite: YELLOW_SPRITES,
    generation: 1,
    region: "Kanto",
    modifiers: GEN_ONE,
    pokedex: GEN_1_POKEDEX
}

//Generation 2
export const Gold:Game = {
    name: "Gold Version",
    sprite: GOLD_SPRITE,
    generation: 2,
    region: "Johto/Kanto",
    modifiers: GEN_TWO,
    pokedex: GEN_2_POKEDEX
}
export const Silver:Game = {
    name: "Silver Version",
    sprite: SILVER_SPRITE,
    generation: 2,
    region: "Johto/Kanto",
    modifiers: GEN_TWO,
    pokedex: GEN_2_POKEDEX
}
export const Crystal:Game = {
    name: "Crystal Version",
    sprite: CRYSTAL_SPRITE,
    generation: 2,
    region: "Johto/Kanto",
    modifiers: GEN_TWO,
    pokedex: GEN_2_POKEDEX
}

//Generation 3
export const Ruby:Game = {
    name: "Ruby",
    sprite: GEN_THREE_SPRITE,
    generation: 3,
    region: "Hoenn",
    modifiers: GEN_THREE,
    pokedex: GEN_3_POKEDEX
}
export const Sapphire:Game = {
    name: "Sapphire",
    sprite: GEN_THREE_SPRITE,
    generation: 3,
    region: "Hoenn",
    modifiers: GEN_THREE,
    pokedex: GEN_3_POKEDEX
}
export const Emerald:Game = {
    name: "Emerald",
    sprite: GEN_THREE_SPRITE,
    generation: 3,
    region: "Hoenn",
    modifiers: GEN_THREE,
    pokedex: GEN_3_POKEDEX
}
export const FireRed:Game = {
    name: "Fire Red",
    sprite: GEN_THREE_REMAKE_SPRITE,
    generation: 3,
    region: "Kanto",
    modifiers: GEN_THREE,
    pokedex: FIRE_LEAF_POKEDEX
}
export const LeafGreen:Game = {
    name: "Leaf Green",
    sprite: GEN_THREE_REMAKE_SPRITE,
    generation: 3,
    region: "Kanto",
    modifiers: GEN_THREE,
    pokedex: FIRE_LEAF_POKEDEX
}

//Generation 4
export const Diamond:Game = {
    name: "Diamond",
    sprite: GEN_FOUR_SPRITE,
    generation: 4,
    region: "Sinnoh",
    modifiers: GEN_FOUR,
    pokedex: GEN_4_POKEDEX
}
export const Pearl:Game = {
    name: "Pearl",
    sprite: GEN_FOUR_SPRITE,
    generation: 4,
    region: "Sinnoh",
    modifiers: GEN_FOUR,
    pokedex: GEN_4_POKEDEX
}
export const Platinum:Game = {
    name: "Platinum",
    sprite: GEN_FOUR_SPRITE,
    generation: 4,
    region: "Sinnoh",
    modifiers: GEN_FOUR,
    pokedex: GEN_4_POKEDEX
}
export const HeartGold:Game = {
    name: "Heart Gold",
    sprite: GEN_FOUR_REMAKE_SPRITE,
    generation: 4,
    region: "Johto/Kanto",
    modifiers: GEN_FOUR,
    pokedex: HEART_SOUL_POKEDEX
}
export const SoulSilver:Game = {
    name: "Soul Silver",
    sprite: GEN_FOUR_REMAKE_SPRITE,
    generation: 4,
    region: "Johto/Kanto",
    modifiers: GEN_FOUR,
    pokedex: HEART_SOUL_POKEDEX
}

//Generation 5
export const Black:Game = {
    name: "Black",
    sprite: GEN_FIVE_SPRITE,
    generation: 5,
    region: "Unova",
    modifiers: GEN_FIVE,
    pokedex: GEN_5_POKEDEX
}
export const White:Game = {
    name: "White",
    sprite: GEN_FIVE_SPRITE,
    generation: 5,
    region: "Unova",
    modifiers: GEN_FIVE,
    pokedex: GEN_5_POKEDEX
}
export const Black2:Game = {
    name: "Black Two",
    sprite: GEN_FIVE_SPRITE,
    generation: 5,
    region: "Unova",
    modifiers: GEN_FIVE,
    pokedex: GEN_5_2_POKEDEX
}
export const White2:Game = {
    name: "White Two",
    sprite: GEN_FIVE_SPRITE,
    generation: 5,
    region: "Unova",
    modifiers: GEN_FIVE,
    pokedex: GEN_5_2_POKEDEX
}

//Generation 6
export const X:Game = {
    name: "X",
    sprite: GEN_SIX_SPRITE,
    generation: 6,
    region: "Kalos",
    modifiers: GEN_SIX,
    pokedex: GEN_6_POKEDEX
}
export const Y:Game = {
    name: "Y",
    sprite: GEN_SIX_SPRITE,
    generation: 6,
    region: "Kalos",
    modifiers: GEN_SIX,
    pokedex: GEN_6_POKEDEX
}
export const AlphaSapphire:Game = {
    name: "Alpha Sapphire",
    sprite: GEN_SIX_SPRITE,
    generation: 6,
    region: "Hoenn",
    modifiers: GEN_SIX,
    pokedex: ALPHA_OMEGA_POKEDEX
}
export const OmegaRuby:Game = {
    name: "Omega Ruby",
    sprite: GEN_SIX_SPRITE,
    generation: 6,
    region: "Hoenn",
    modifiers: GEN_SIX,
    pokedex: ALPHA_OMEGA_POKEDEX
}

//Generation 7
export const Sun:Game = {
    name: "Sun",
    sprite: GEN_SEVEN_SPRITE,
    generation: 7,
    region: "Alola",
    modifiers: GEN_SEVEN,
    pokedex: GEN_7_POKEDEX
}
export const Moon:Game = {
    name: "Moon",
    sprite: GEN_SEVEN_SPRITE,
    generation: 7,
    region: "Alola",
    modifiers: GEN_SEVEN,
    pokedex: GEN_7_POKEDEX
}
export const UltraSun:Game = {
    name: "Ultra Sun",
    sprite: GEN_SEVEN_SPRITE,
    generation: 7,
    region: "Alola",
    modifiers: GEN_SEVEN,
    pokedex: GEN_7_2_POKDEX
}
export const UltraMoon:Game = {
    name: "Ultra Moon",
    sprite: GEN_SEVEN_SPRITE,
    generation: 7,
    region: "Alola",
    modifiers: GEN_SEVEN,
    pokedex: GEN_7_2_POKDEX
}
export const LetsGoPikachu:Game = {
    name: "Let's Go Pikachu",
    sprite: LETS_GO_SPRITES,
    generation: 7,
    region: "Kanto",
    modifiers: LIMITED,
    pokedex: LEST_GO_POKEDEX
}
export const LetsGoEevee:Game = {
    name: "Let's Go Eevee",
    sprite: LETS_GO_SPRITES,
    generation: 7,
    region: "Kanto",
    modifiers: LIMITED,
    pokedex: LEST_GO_POKEDEX
}

//Generation 8
export const Sword:Game = {
    name: "Sword",
    sprite: GEN_EIGHT_SPRITE,
    generation: 8,
    region: "Galar",
    modifiers: GEN_EIGHT,
    pokedex: GEN_8_POKEDEX
}
export const Shield:Game = {
    name: "Shield",
    sprite: GEN_EIGHT_SPRITE,
    generation: 8,
    region: "Galar",
    modifiers: GEN_EIGHT,
    pokedex: GEN_8_POKEDEX
}
export const BrilliantDiamond:Game = {
    name: "Brilliant Diamond",
    sprite: GEN_EIGHT_SPRITE,
    generation: 8,
    region: "Sinnoh",
    modifiers: GEN_EIGHT,
    pokedex: BRILLIANT_SHINING_POKEDEX
}
export const ShiningPearl:Game = {
    name: "Shining Pearl",
    sprite: GEN_EIGHT_SPRITE,
    generation: 8,
    region: "Sinnoh",
    modifiers: GEN_EIGHT,
    pokedex: BRILLIANT_SHINING_POKEDEX
}
export const LegendsArceus:Game = {
    name: "Legends: Arceus",
    sprite: GEN_EIGHT_SPRITE,
    generation: 8,
    region: "Hisui",
    modifiers: LIMITED,
    pokedex: LEGENDS_ARCEUS_POKEDEX
}

//Generation 9
export const Scarlet:Game = {
    name: "Scarlet",
    sprite: GEN_NINE_SPRITE,
    generation: 9,
    region: "Paldea/Kitakami",
    modifiers: GEN_NINE,
    pokedex: GEN_9_POKEDEX
}
export const Violet:Game = {
    name: "Violet",
    sprite: GEN_NINE_SPRITE,
    generation: 9,
    region: "Paldea/Kitakami",
    modifiers: GEN_NINE,
    pokedex: GEN_9_POKEDEX
}
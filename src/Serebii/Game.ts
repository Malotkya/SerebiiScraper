/** /Serebii/Game
 * 
 * Game Data (Not Worth Attempting to Scrape)
 * 
 * @author Alex Malotky
 */

import Modifier, { GEN_EIGHT, GEN_FIVE, GEN_FOUR, GEN_NINE, GEN_ONE, GEN_SEVEN, GEN_SIX, GEN_THREE, GEN_TWO, LIMITED } from "./Modifiers.js"
import Sprite, { CRYSTAL_SPRITE, GEN_EIGHT_SPRITE, GEN_FIVE_SPRITE, GEN_FOUR_REMAKE_SPRITE, GEN_FOUR_SPRITE, GEN_NINE_SPRITE, GEN_SEVEN_SPRITE, GEN_SIX_SPRITE, GEN_THREE_REMAKE_SPRITE, GEN_THREE_SPRITE, GOLD_SPRITE, GREEN_SPRITE, LETS_GO_SPRITES, RED_BLUE_SPRITES, SILVER_SPRITE, YELLOW_SPRITES } from "./Sprite.js"

interface Game {
    name:string,
    sprite: Sprite,
    generation: number,
    modifiers: Modifier
}

//Generation 1
const Green:Game = {
    name: "Green Version",
    sprite: GREEN_SPRITE,
    generation: 1,
    modifiers: GEN_ONE
};
const Red:Game = {
    name: "Red Version",
    sprite: RED_BLUE_SPRITES,
    generation: 1,
    modifiers: GEN_ONE
}
const Blue:Game = {
    name: "Blue Version",
    sprite: RED_BLUE_SPRITES,
    generation: 1,
    modifiers: GEN_ONE
}
const Yellow:Game = {
    name: "Yellow Version",
    sprite: YELLOW_SPRITES,
    generation: 1,
    modifiers: GEN_ONE
}

//Generation 2
const Gold:Game = {
    name: "Gold Version",
    sprite: GOLD_SPRITE,
    generation: 2,
    modifiers: GEN_TWO
}
const Silver:Game = {
    name: "Silver Version",
    sprite: SILVER_SPRITE,
    generation: 2,
    modifiers: GEN_TWO
}
const Crystal:Game = {
    name: "Crystal Version",
    sprite: CRYSTAL_SPRITE,
    generation: 2,
    modifiers: GEN_TWO
}

//Generation 3
const Ruby:Game = {
    name: "Ruby",
    sprite: GEN_THREE_SPRITE,
    generation: 3,
    modifiers: GEN_THREE
}
const Sapphire:Game = {
    name: "Sapphire",
    sprite: GEN_THREE_SPRITE,
    generation: 3,
    modifiers: GEN_THREE
}
const Emerald:Game = {
    name: "Emerald",
    sprite: GEN_THREE_SPRITE,
    generation: 3,
    modifiers: GEN_THREE
}
const FireRed:Game = {
    name: "Fire Red",
    sprite: GEN_THREE_REMAKE_SPRITE,
    generation: 3,
    modifiers: GEN_THREE
}
const LeafGreen:Game = {
    name: "Leaf Green",
    sprite: GEN_THREE_REMAKE_SPRITE,
    generation: 3,
    modifiers: GEN_THREE
}

//Generation 4
const Diamond:Game = {
    name: "Diamond",
    sprite: GEN_FOUR_SPRITE,
    generation: 4,
    modifiers: GEN_FOUR
}
const Pearl:Game = {
    name: "Pearl",
    sprite: GEN_FOUR_SPRITE,
    generation: 4,
    modifiers: GEN_FOUR
}
const Platinum:Game = {
    name: "Platinum",
    sprite: GEN_FOUR_SPRITE,
    generation: 4,
    modifiers: GEN_FOUR
}
const HeartGold:Game = {
    name: "Heart Gold",
    sprite: GEN_FOUR_REMAKE_SPRITE,
    generation: 4,
    modifiers: GEN_FOUR
}
const SoulSilver:Game = {
    name: "Soul Silver",
    sprite: GEN_FOUR_REMAKE_SPRITE,
    generation: 4,
    modifiers: GEN_FOUR
}

//Generation 5
const Black:Game = {
    name: "Black",
    sprite: GEN_FIVE_SPRITE,
    generation: 5,
    modifiers: GEN_FIVE
}
const White:Game = {
    name: "White",
    sprite: GEN_FIVE_SPRITE,
    generation: 5,
    modifiers: GEN_FIVE
}
const Black2:Game = {
    name: "Black Two",
    sprite: GEN_FIVE_SPRITE,
    generation: 5,
    modifiers: GEN_FIVE
}
const White2:Game = {
    name: "White Two",
    sprite: GEN_FIVE_SPRITE,
    generation: 5,
    modifiers: GEN_FIVE
}

//Generation 6
const X:Game = {
    name: "X",
    sprite: GEN_SIX_SPRITE,
    generation: 6,
    modifiers: GEN_SIX
}
const Y:Game = {
    name: "Y",
    sprite: GEN_SIX_SPRITE,
    generation: 6,
    modifiers: GEN_SIX
}
const AlphaSapphire:Game = {
    name: "Alpha Sapphire",
    sprite: GEN_SIX_SPRITE,
    generation: 6,
    modifiers: GEN_SIX
}
const OmegaRuby:Game = {
    name: "Omega Ruby",
    sprite: GEN_SIX_SPRITE,
    generation: 6,
    modifiers: GEN_SIX
}

//Generation 7
const Sun:Game = {
    name: "Sun",
    sprite: GEN_SEVEN_SPRITE,
    generation: 7,
    modifiers: GEN_SEVEN
}
const Moon:Game = {
    name: "Moon",
    sprite: GEN_SEVEN_SPRITE,
    generation: 7,
    modifiers: GEN_SEVEN
}
const UltraSun:Game = {
    name: "Ultra Sun",
    sprite: GEN_SEVEN_SPRITE,
    generation: 7,
    modifiers: GEN_SEVEN
}
const UltraMoon:Game = {
    name: "Ultra Moon",
    sprite: GEN_SEVEN_SPRITE,
    generation: 7,
    modifiers: GEN_SEVEN
}
const LetsGoPikachu:Game = {
    name: "Let's Go Pickachu",
    sprite: LETS_GO_SPRITES,
    generation: 7,
    modifiers: LIMITED
}
const LetsGoEevee:Game = {
    name: "Let's Go Eevee",
    sprite: LETS_GO_SPRITES,
    generation: 7,
    modifiers: LIMITED
}

//Generation 8
const Sword:Game = {
    name: "Sword",
    sprite: GEN_EIGHT_SPRITE,
    generation: 8,
    modifiers: GEN_EIGHT
}
const Shield:Game = {
    name: "Shield",
    sprite: GEN_EIGHT_SPRITE,
    generation: 8,
    modifiers: GEN_EIGHT
}
const BrilliantDiamond:Game = {
    name: "Brilliant Diamond",
    sprite: GEN_EIGHT_SPRITE,
    generation: 8,
    modifiers: GEN_EIGHT
}
const ShiningPearl:Game = {
    name: "Shining Pearl",
    sprite: GEN_EIGHT_SPRITE,
    generation: 8,
    modifiers: GEN_EIGHT
}
const Arceus:Game = {
    name: "Legends: Arceus",
    sprite: GEN_EIGHT_SPRITE,
    generation: 8,
    modifiers: LIMITED
}

//Generation 9
const Scarlet:Game = {
    name: "Scarlet",
    sprite: GEN_NINE_SPRITE,
    generation: 9,
    modifiers: GEN_NINE
}
const Violet:Game = {
    name: "Violet",
    sprite: GEN_NINE_SPRITE,
    generation: 9,
    modifiers: GEN_NINE
}

export async function getAllGameDataList():Promise<Record<string, Game>> {
    return {
        Green, Red, Blue, Yellow,
        Gold, Silver, Crystal,
        Ruby, Sapphire, Emerald, FireRed, LeafGreen,
        Diamond, Pearl, Platinum, HeartGold, SoulSilver,
        Black, White, Black2, White2,
        X, Y, AlphaSapphire, OmegaRuby,
        Sun, Moon, UltraSun, UltraMoon, LetsGoEevee, LetsGoPikachu,
        Sword, Shield, BrilliantDiamond, ShiningPearl, Arceus,
        Scarlet, Violet
    }
}
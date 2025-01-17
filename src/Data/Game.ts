/** /Data/Game
 * 
 * @author Alex Malotky
 */
import Game, {
    Green, Red, Blue, Yellow,
    Gold, Silver, Crystal,
    Ruby, Sapphire, Emerald, FireRed, LeafGreen,
    Diamond, Pearl, Platinum, HeartGold, SoulSilver,
    Black, White, Black2, White2,
    X, Y, AlphaSapphire, OmegaRuby,
    Sun, Moon, UltraSun, UltraMoon, LetsGoEevee, LetsGoPikachu,
    Sword, Shield, BrilliantDiamond, ShiningPearl, Arceus,
    Scarlet, Violet
} from "../Serebii/Game.js"

export async function verifiedGameData():Promise<Record<string, Game>> {
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
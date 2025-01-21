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
import { toSQLString, stringifyForSQL } from "../util.js";

type GameData = Record<string, Game>
export default GameData;

export async function verifiedGameData():Promise<GameData> {
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

export function generateGameSQL(data:GameData):string {
    const buffer = [
        "DROP TABLE IF EXISTS Games;",
        `CREATE TABLE Games(
            id TEXT PRIMARY KEY,
            name TEXT,
            sprite TEXT,
            generation INTEGER,
            modifiers TEXT
        );`.replaceAll(/\s+/g, " ")
    ];

    for(const id in data) {
        const game = data[id];
        buffer.push(`INSERT INTO Games VALUES(
            ${toSQLString(id)},
            ${toSQLString(game.name)},
            ${stringifyForSQL(game.sprite)},
            ${game.generation},
            ${stringifyForSQL(game.modifiers)}
        );`.replaceAll(/\s+/g, " "));
    }

    return buffer.join("\n");
}
/** /Serebii/Item
 * 
 * Contains Fixes for Errors that occured during testing
 * 
 * @author Alex Malotky
 */

export function missingItems():Record<string, string> {
    return {
        // https://www.serebii.net//itemdex/parlyzheal.shtml (404) - Not Found
        "Paralyze Heal": "Heals the Paralysis Status Ailment.",

        // https://www.serebii.net//itemdex/xdefend.shtml (404) - Not Found
        "X Defend": "In battle, it raises the Pokémon's Defence by 1 stage until the battle is over or the Pokémon is withdrawn. Increases Pokémon's Happiness.<br>As of Pokémon Sun &amp; Moon, it boosts by 2 stages",

        // https://www.serebii.net//itemdex/xspecial.shtml (404) - Not Found
        "X Special": "In battle, it raises the Pokémon's Special by 1 stage until the battle is over or the Pokémon is withdrawn."
    }
}

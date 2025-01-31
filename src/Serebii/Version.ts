/** /Serebii/Version
 * 
 * @author Alex Malotky
 */
import Type from "./Type.js";
import {JSDOM} from "jsdom";

/** Version Info
 * 
 */
interface Version {
    match: string,
    full: string,
    ext: string
}
export default Version;

/** Get Version
 * 
 * @param {string} value 
 * @returns {string}
 */
export function getAllVersions(value:string|undefined, pokemonName:string):Record<string, Version> {
    if(value === undefined)
        return {};

    const output:Record<string, Version> = {};

    const {document} = new JSDOM(value).window;
    const links = <NodeListOf<HTMLAnchorElement>>document.querySelectorAll("a[data-key]");
    if(links.length === 0){
        const imgs = document.querySelectorAll("img");

        const extensions = Array.from(imgs).map(img=>{
            const match = img.src.match(/\d+(.*)\..*$/);
            if(match){
                return [match[1], img];
            }
            return null;
        }).filter((s, c, a)=>{
            if(s === null)
                return false;
            
            for(let i=0; i<c; i++){
                const t = a[i];
                if(t && t[0] === s[0])
                    return false;
            }

            return true;
        }) as [string, HTMLImageElement][];

        const names = Array.from(<NodeListOf<HTMLElement>>document.querySelectorAll("td"));
        const list = matchNamesToValues(extensions, names, (a, b)=>{
            const lhs = a.length === 0
                ? ""
                : a.length > 1
                    ? a.charAt(1).toLocaleLowerCase()
                    : a.charAt(0).toLocaleLowerCase();

            const rhs = b.charAt(0).toLocaleLowerCase();
            return lhs === rhs;
        });

        for(const value of list){
            if(validName(value.full, pokemonName))
                output[strip(value.full)] = value;
        }

    } else { //Normal Method
        for(const anchor of links){
            const name = anchor.title;
            if(validName(name, pokemonName)){
                const match = anchor.getAttribute("data-key")!.match(/\d+(.*?)/);
        
                if(match){
                    output[strip(name)] = {
                        full: name,
                        ext: match[1],
                        match: anchor.outerHTML
                    };
                } else {
                    output[strip(name)] = {
                        full: name,
                        ext: "",
                        match: anchor.outerHTML
                    };
                }
            }
        }
    }

    return output;
}

/** Match Name To Values
 * 
 * @param {Array} extensions 
 * @param {Array} names 
 * @param {Function} callback 
 * @returns {Array}
 */
function matchNamesToValues(extensions:[string, HTMLImageElement][], names:HTMLElement[], callback:(a:string, b:string)=>boolean):Version[] {
    const output:Version[] = [];

    let i = 0;
    while(i < extensions.length){
        const [ext, img] = extensions[i];

        let inc:boolean = true;
        for(let d=0; d<names.length; d++){
            while(names[d].textContent === null)
                names.splice(d, 1);
            const value = names[d].textContent!;

            if(value && callback(ext, value)){
                output.push({
                    match: img.outerHTML + names[d].outerHTML,
                    full: value,
                    ext: ext
                });
                names.splice(d, 1);
                extensions.splice(i, 1);
                inc = false;
                break;
            }
        }

        if(inc){
            i++
        }
    }

    //Try to Find Normal Form it Doesn't Exist
    if(output.length === 1 && output[0].full.match(/normal/i) === null){
        output.push(findMatch(output[0], names) || {
            match: "Normal Insert",
            ext: "",
            full: "Normal Form"
        })
    }
    
    //Delete Unused Empty Extensions
    let r=0;
    while(r<extensions.length){
        if(extensions[r][0] === ""){
            extensions.splice(r, 1);
        } else {
            ++r;
        }
    }

    return output;
}

/** Find Version Match
 * 
 * @param {Version} version 
 * @param {Array} list 
 * @returns {Version|null}
 */
function findMatch(version:Version, list:HTMLElement[]):Version|null {
    const test = version.full.toLocaleLowerCase().split(/\s+/);

    for(let i=0; i < list.length; i++){
        const element = list[i];
        for(const value of element.textContent!.toLocaleLowerCase().split(/\s+/)) {
            if(test.includes(value)){
                list.splice(i, 1);

                return {
                    ext: "",
                    full: element.textContent!,
                    match: element.outerHTML + "~" +version.match
                }
            }
        }
    }

    return null;
}

/** Valid Name
 * 
 * @param {string} value 
 * @returns 
 */
function validName(value:string, name:string):boolean {
    if(value.match(/game boy/i))
        return false;

    if(value.match(/cap/i))
        return false;

    if(value.match(new RegExp(name, "i")))
        return false;

    return value !== "";
}

/** Strip Undesired words from names.
 * 
 * @param {string} value 
 * @returns {string}
 */
function strip(value:string):string {
    return value.replaceAll(/form(?!e)/gi, "")
        .trim();
}

/** Normalize Versions And Types
 * 
 * @param {Object} versions 
 * @param {Object} types 
 * @returns {Object}
 */
export function normalizeVersionAndTypes(versions:Record<string, Version>, types:Record<string, Type[]>):[Record<string, string>, boolean]{
    
    const output:Record<string, string> = {};
    let gendered = false;

    const versionList = Object.keys(versions);
    const typeList = Object.keys(types);

    let test = versionList.indexOf("Female");
    if(test >= 0) {
        gendered = true;
        versionList.splice(test, 1);
        delete versions["Female"];

        const index = typeList.indexOf("Female");
        if(index >= 0) {
            typeList.splice(index, 1);
            delete types["Female"];
        }
    }

    test = versionList.indexOf("Male");
    if(test >= 0) {
        gendered = true;
        versionList.splice(test, 1);
        delete versions["Male"];

        const index = typeList.indexOf("Male");
        if(index >= 0) {
            typeList.splice(index, 1);
            delete types["Male"];
        }
    }

    if(versionList.length === 0){
        versionList.push("Normal");
        versions["Normal"] = {ext: ""} as any;
    }

    if(typeList.length === 1){
        const type = types[typeList[0]];
        delete types[typeList[0]];

        if(versionList.length === 0) {
            types[""] = type;
            output["Normal"] = "";

        } else {

            for(const name in versions){
                const ext = versions[name].ext;

                types[ext] = type;
                output[name] = ext;
            }
        }

    } else {

        let i=0;
        while(i < versionList.length){
            const name = versionList[i];

            if(typeList.indexOf(name) === -1) {
                ++i;
                continue;
            }

            const ext = versions[name].ext;
            types[ext] = types[name];
            output[name] = ext;
            
            delete types[name];
            
            versionList.splice(i, 1);
        }
    }

    return [output, gendered];
}
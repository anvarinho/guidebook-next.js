export function getLangName(lang: string, place: Place){
    if (lang === "en"){
        return place.name.en
    }else if (lang === "fr"){
        return place.name.fr
    }else if (lang === "de"){
        return place.name.de
    }else if (lang === "es"){
        return place.name.es
    }else if (lang === "ru"){
        return place.name.ru
    }
}

export function getLangTitle(lang: string, place: Place){
    if (lang === "en"){
        return place.title.en
    }else if (lang === "fr"){
        return place.title.fr
    }else if (lang === "de"){
        return place.title.de
    }else if (lang === "es"){
        return place.title.es
    }else if (lang === "ru"){
        return place.title.ru
    }
}

export function getLangDescription(lang: string, place: Place){
    if (lang === "en"){
        return place.description.en
    }else if (lang === "fr"){
        return place.description.fr
    }else if (lang === "de"){
        return place.description.de
    }else if (lang === "es"){
        return place.description.es
    }else if (lang === "ru"){
        return place.description.ru
    }
}

export function getLangKeywords(lang: string, place: Place){
    if (lang === "en"){
        return place.keywords.en
    }else if (lang === "fr"){
        return place.keywords.fr
    }else if (lang === "de"){
        return place.keywords.de
    }else if (lang === "es"){
        return place.keywords.es
    }else if (lang === "ru"){
        return place.keywords.ru
    }
}

export function getLangRegions(lang: string, place: Place){
    if (lang === "en"){
        return place.region.en
    }else if (lang === "fr"){
        return place.region.fr
    }else if (lang === "de"){
        return place.region.de
    }else if (lang === "es"){
        return place.region.es
    }else if (lang === "ru"){
        return place.region.ru
    }
}
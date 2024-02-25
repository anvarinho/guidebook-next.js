type Place = {
    "_id": string,
    "name": Translations,
    "title": Translations,
    "region": Translations,
    "created": Date,
    "description": Translations,
    "keywords": Translations,
    "url": string,
    "image": [string],
    "viewCount": number,
    "weather": Weather?
}
type Tour = {
    "_id": string,
    "name": string,
    "title": string,
    "created": Date,
    "description": string,
    "keywords": string,
    "url": string,
    "image": [string],
    "viewCount": number,
}
type Translations = {
    "en": string,
    "fr": string,
    "de": string,
    "es": string,
    "it": string,
    "jp": string,
    "kr": string,
    "ae": string,
    "ru": string,
    "cn": string,
}

type PlaceData = {
    "place": Place
}

type TourData = {
    "tour": Tour
}

type Weather = {
    "temp": string,
    "main": string,
    "description": string,
    "icon": string
}

type Places = {
    "count": number,
    "places": [PlaceData]
}

type Tours = {
    "count": number,
    "tours": [TourData]
}

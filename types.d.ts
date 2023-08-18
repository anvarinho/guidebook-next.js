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
type Translations = {
    "en": string,
    "fr": string,
    "de": string,
    "es": string,
    "ru": string,
}

type PlaceData = {
    "place": Place
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
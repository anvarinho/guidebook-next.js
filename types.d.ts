type Place = {
    "_id": string,
    "name": string,
    "title": string,
    "region": string,
    "created": Date,
    "description": string,
    "keywords": [string],
    "url": string,
    "image": [string],
    "weather": Weather?
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
type Place = {
    "_id": string,
    "name": string,
    "title": string,
    "region": string,
    "created": Date,
    "description": string,
    "keywords": [string],
    "url": string,
    "image": [string]
}

type PlaceData = {
    "place": Place
}

type Places = {
    "count": number,
    "places": [PlaceData]
}
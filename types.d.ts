type Place = {
    "id": string,
    "name": string,
    "title": string,
    "description": string,
}

type PlaceData = {
    "place": Place
}

type Data = {
    "count": number,
    "places": [Place]
}
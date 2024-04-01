type Place = {
    "_id": string,
    "name": string,
    "title": string,
    "region": string,
    "created": Date,
    "description": string,
    "keywords": string,
    "url": string,
    "images": [string],
    "sights": [string]?,
    "viewCount": number,
}

type Tour = {
    "_id": string,
    "title": string,
    "created": Date,
    "description": string,
    "keywords": string,
    "url": string,
    "images": [string],
    "viewCount": number,
    "days": [Day]
}

type Day = {
    "activities": [string],
    "images": [string],
    "places": [string]
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

type PlaceAlias = {
    "_id": string,
    "name": string,
    "title": string,
    "region": string,
    "url": string,
    // "blurDataURL": string?,
    "images": [string],
    "weather": Weather?
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
    "places": [PlaceAlias]
}

type Tours = {
    "count": number,
    "tours": [TourData]
}

type Article = {
    "_id": string,
    "title": string,
    "subtitle": string,
    "image": string?,
    "paragraphs": [Paragraph],
    "url": string,
    "viewCount": number,
    "createdAt": Date,
    "keywords": string
}

type Paragraph = {
    "title": string,
    "text": string,
    "image": string?,
    "link": string?,
}
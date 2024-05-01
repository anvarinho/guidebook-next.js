export default async function getWeatherData(params: string) {
    const cities = ['Bishkek', 'Osh', 'Naryn', 'Talas', 'Batken', 'Cholpon-Ata', 'Jalal-Abad', 'Karakol']
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${params}&appid=12203a39a3f20b2e3d59ff3a6f23714b&units=metric`
    const response = await fetch(url)
    return response.json()
}

const express = require('express');
const path = require("path");
const bodyParser = require('body-parser');

const app = express();
const urlEncodedParser = bodyParser.urlencoded();

app.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname, './form.html'));
});

app.post('/form', urlEncodedParser, async ({body}, res)=>{

    console.log(body)
    let getCoordinates = await fetch(`https://melchior.moja.it:8085/map-api/convert-address?street=${body.street}&number=${body.number}&city=${body.city}&province=${body.province}&zip_code=${body.zip_code}`);
    let coordinates = await getCoordinates.json();
    console.log(coordinates);

    let getWeather = await fetch(`https://melchior.moja.it:8085/weather-api/get_weather?lat=${coordinates.latitude}&lon=${coordinates.longitude}`)
    let weather = await getWeather.json();
    console.log(weather);

    res.send(weather);
})
app.get('/weather_data', urlEncodedParser, async ({query:{street, number, city, province, zip_code}}, res)=>{
    if(street && number && city && province && zip_code){
        let getCoordinates = await fetch(`https://melchior.moja.it:8085/map-api/convert-address?street=${street}&number=${number}&city=${city}&province=${province}&zip_code=${zip_code}`);
        let coordinates = await getCoordinates.json();

        if(coordinates.error){
            res.send({error: 'Could not find the address'});
        }
        else{
            let getWeather = await fetch(`https://melchior.moja.it:8085/weather-api/get_weather?lat=${coordinates.latitude}&lon=${coordinates.longitude}`)
            let weather = await getWeather.json();
            console.log(weather)
            if(weather.error){
                res.send({error: 'Could not find weather information for this address'});
            }
            else{
                weather.location = `${street} ${number}, ${city}, ${province}, ${zip_code}`;

                res.send(weather);
            }
        }
    }
    else{
        res.send({error: 'Incorrect address values!'});
    }
})
app.listen(3000, ()=>{
    console.log('Server listening')
})
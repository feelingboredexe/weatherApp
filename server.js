const unirest = require("unirest")
const express = require("express")

// dark sky API credentials
const credentials = require('./apiCredentials.json');

// express server setup
const app = express();

// makes express try to serve the files in public folder
// public folder contains all html
app.use(express.static('/public'));

// routes are how we tell express to handle requests
// get route for path /weather
app.get('/weather', (req, res) => {
    // get client latitude and longitude coordinates as query parameters
    // query parameters are the things after the & in urls
    const { lat, lon } = req.query;

    // using unirest to make HTTP requests
    // unirest request
    // passing two parameters: request type "GET" and URL to make request to
    // the url will evaluate to 'https://dark-sky.p.rapidapi.com/37.769421,-122.486214' in the case of golden gate park in SF
    let request = unirest("GET", `https://${credentials.host}/${lat},${lon}`);

    // adds to query parameters lang and units
    // en is obviously short for "english"
    // auto will let dark sky determine the best units to use
    request.query({
        lang: "en",
        units: "auto"
    });

    // adds headers to request, which are the api credentials for dark sky
    request.headers({
        "x-rapidapi-host": credentials.host,
        "x-rapidapi-key": credentials.apiKey
    });

    // sends a request and then supplies data it gets back
    // the single parameter "response" will contain the response from dark sky
    request.end(response => {
        if (response.error) res.status(500).end(); // send an error code to the client if there's an error
        // handle response
        const {
            summary,
            precipProbability,
            temperature,
            windSpeed,
            windBearing
        } = response.body.currently; // pull out everything we need from the response
        
        // send data to client]
        res.status(200).send(   // res.status sets the status code for the response, which is 200 for success
            JSON.stringify({
                summary: summary,
                chanceOfRain: precipProbability,
                temp: temperature,
                wind: {
                    speed: windSpeed,
                    bearing: windBearing
                }
            }) // send data in stringified JSON object using res.send
        );
    });
});



// calling listen function
// arrow operator defines an anonymous function
app.listen(3000, () => {
    console.info('Listening on port :3000');
});


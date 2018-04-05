var express = require('express');
var app = express();
var fetch = require('node-fetch');
var weatherService = require('./services/weather.js');
var weather_units_toggle_flag;

var renderThisObj = function(vars, change_location_value) {
    return {
        cityCountry: vars.cityCountry,
        date: vars.date,
        time: vars.time,
        weatherDesc: vars.weatherDesc,
        weatherIcon: vars.weatherIcon,
        temp: vars.temp,
        wind: vars.wind,
        humidity: vars.humidity,
        pressure: vars.pressure,
        sunrise: vars.sunrise,
        sunset: vars.sunset,
        units_toggle_value: vars.units_toggle_value,
        change_location_value: change_location_value,
    };
};

// app.set('views', __dirname + '/views'); // needed?
app.set('view engine', 'pug');
app.use('/icons', express.static('./icons'));
app.use(express.static('styles'));

app.get('/', function(req, res) {
    res.render('index');
});

app.get('/weather', function(req, res) {
    var units = req.query.units || weather_units_toggle_flag;
    var location = req.query.location;

    var change_location_value = (function() {
        return location === 'Montevideo' ? 'NYC' : 'Montevideo';
    }());

    var myRequestID = (function() {
       	return location === 'Montevideo' ? '3441575' : '5128594';
    }());
    
    var myRequest = `http://api.openweathermap.org/data/2.5/weather?id=${myRequestID}&units=imperial&APPID=6acfabbd05a295060972abd7cb5f56f7`;

    fetch(myRequest)
        .then(function(res) {
            return res.json();
        })
        .then(function(myjson) {
            return weatherService.insertWeather(myjson);
        })
        .then(function() {
            return weatherService.getWeather(units);
        })
        .then(function(vars) { // promisify?
            res.render('indexreport', renderThisObj(vars, change_location_value));
        })
        .catch((e) => console.error(e))
    ;
});

app.get('/weather_units_toggle', function(req, res) {
    var units = req.query.units_toggle;
    
    weather_units_toggle_flag = units;

    Promise.resolve()
        .then(function() {
            return weatherService.getWeather(units);
        })
        .then(function(vars) { // promisify?
            var change_location_value = (function() {
                return vars.city === 'Montevideo' ? 'NYC' : 'Montevideo';
            }());

            res.render('indexreport', renderThisObj(vars, change_location_value));
        })
        .catch((e) => console.error(e))
    ;
});

app.listen(8080);
console.log('Server running at localhost:8080');
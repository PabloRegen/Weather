const path = require('path');
var sqlite3 = require('sqlite3').verbose();
// Create and automatically open the db. There is no separate method to open the db
var db = new sqlite3.Database(path.join(__dirname, '../database/weather.db'));
var dataCleaner = require('./cleaners/data_cleaner');

var createTable = `
    CREATE TABLE IF NOT EXISTS CurrentWeather (
        TimeStamp integer DEFAULT CURRENT_TIMESTAMP,
        City_ID integer,
        City_name text,
        Country text,
        Date_Time integer,
        W_main text,
        W_desc text,
        W_icon text,
        Temp integer,
        Wind_Sp integer,
        Wind_Dir integer,
        Humidity integer,
        Pressure integer,
        Sunrise integer,
        Sunset integer
    )
`;

var insertIntoTable = `
    INSERT INTO CurrentWeather (
        City_ID,
        City_name,
        Country,
        Date_Time,
        W_main,
        W_desc,
        W_icon,
        Temp,
        Wind_Sp,
        Wind_Dir,
        Humidity,
        Pressure,
        Sunrise,
        Sunset
    )
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
`;

var queryTable = `
    SELECT
        TimeStamp,
        City_ID,
        City_name,
        Country,
        datetime(Date_Time, "unixepoch", "localtime") AS "Date_Time",
        W_main,
        W_desc,
        W_icon,
        Temp,
        Wind_Sp,
        Wind_Dir,
        Humidity,
        Pressure,
        datetime(Sunrise, "unixepoch", "localtime") AS "Sunrise",
        datetime(Sunset, "unixepoch", "localtime") AS "Sunset"
    FROM
        CurrentWeather
    ORDER BY
        TimeStamp DESC LIMIT 1
`;

module.exports = {
    insertWeather: function(json) {
        return new Promise(function(resolve, reject) {
            var serializeCallback = function() {
                db.run(createTable);

                var stmt = db.prepare(insertIntoTable);

                stmt.run(
                    json.id,
                    json.name,
                    json.sys.country,
                    json.dt,
                    json.weather[0].main,
                    json.weather[0].description,
                    json.weather[0].icon,
                    json.main.temp,
                    json.wind.speed,
                    json.wind.deg,
                    json.main.humidity,
                    json.main.pressure,
                    json.sys.sunrise,
                    json.sys.sunset,
                    resolve // resolve callback goes here as per SQLite docs
                );
                
                stmt.finalize();
            };

            db.serialize(serializeCallback);
        });
    },

    getWeather: function(units) {
        return new Promise(function(resolve, reject) {
            var useData = function(err, rows) {
                if (err) { 
                    reject(err); 
                    return; 
                }

                var row = rows[0];
                var weatherData = dataCleaner(row, units);

                var data = {
                    city: weatherData.city,
                    cityCountry: weatherData.cityCountry,
                    date: weatherData.date,
                    time: weatherData.time,
                    weatherDesc: weatherData.weatherDesc,
                    weatherIcon: weatherData.weatherIcon,
                    temp: weatherData.temp,
                    wind: weatherData.wind,
                    humidity: weatherData.humidity,
                    pressure: weatherData.pressure,
                    sunrise: weatherData.sunrise,
                    sunset: weatherData.sunset,
                    units_toggle_value: weatherData.units_toggle_value,
                };

                resolve(data);
            };

            db.all(queryTable, useData);
        });
    }
};
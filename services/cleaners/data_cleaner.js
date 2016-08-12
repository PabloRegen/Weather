var capitalize = require('underscore.string/capitalize'); // https://github.com/epeli/underscore.string

var cleaner = {
    parse: function(row, units) {
        return {
            weatherDesc: capitalize(row.W_desc, true), // or weatherDesc: `${row.W_desc.slice(0,1).toUpperCase()}${row.W_desc.slice(1)}`,
            weatherIcon: `${row.W_icon}.png`,
            temp: cleaner.temp(row, units),
            humidity: row.Humidity,
            pressure: row.Pressure,
            date: `${row.Date_Time.slice(0,4)}.${row.Date_Time.slice(5,7)}.${row.Date_Time.slice(8,10)}`,
            time: row.Date_Time.slice(11,16),
            sunrise: row.Sunrise.slice(11,16),
            sunset: row.Sunset.slice(11,16),
            city: row.City_name,
            cityCountry: cleaner.cityCountry(row),
            wind: cleaner.wind(row, units),
            units_toggle_value: cleaner.units_toggle_value(units),
        };
    },

    temp: function(row, units) {
        return (units === 'Fahrenheit' || units === '°F') ? row.Temp.toFixed(0) + '°F' : ((row.Temp - 32) * 5 / 9).toFixed(0) + '°C';
    },

    cityCountry: function(row) {
        return `${row.City_name}, ${row.Country === 'UY' ? 'Uruguay' : 'USA'}`;
    },

    wind: function(row, units) {
        var windDir = (function(wind) {
            if (wind > 348.75 || wind <= 11.25) return 'n';
            if (wind > 11.25 && wind <= 33.75) return 'nne';
            if (wind > 33.75 && wind <= 56.25) return 'ne';
            if (wind > 56.25 && wind <= 78.75) return 'ene';
            if (wind > 78.75 && wind <= 101.25) return 'e';
            if (wind > 101.25 && wind <= 123.75) return 'ese';
            if (wind > 123.75 && wind <= 146.25) return 'se';
            if (wind > 146.25 && wind <= 168.75) return 'sse';
            if (wind > 168.75 && wind <= 191.25) return 's';
            if (wind > 191.25 && wind <= 213.75) return 'ssw';
            if (wind > 213.75 && wind <= 236.25) return 'sw';
            if (wind > 236.25 && wind <= 258.75) return 'wsw';
            if (wind > 258.75 && wind <= 281.25) return 'w';
            if (wind > 281.25 && wind <= 303.75) return 'wnw';
            if (wind > 303.75 && wind <= 326.25) return 'nw';
            if (wind > 326.25 && wind <= 348.75) return 'nnw';
        }(row.Wind_Dir));

        return (units === 'Fahrenheit' || units === '°F') ? windDir + ' ' + row.Wind_Sp.toFixed(0) + ' mph' : windDir + ' ' + (row.Wind_Sp * 1.609344).toFixed(0) + ' kmh';
    },

    units_toggle_value: function(units) {
        return (units === 'Fahrenheit' || units === '°F') ? '°C' : '°F';
    },
};

module.exports = cleaner.parse;
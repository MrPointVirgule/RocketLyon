/**
 * Script which manage ajax data
 * Created by MrPointVirgule on 09/07/2015.
 */

var stations; //data loaded
var card; //function which transform an array in HTML code via cardTemplate.html (->dot.js)

/**
 * Load the data from stations.json and the template cardTemplate
 * @param callback the function to execute (in scipt.js) when data is ready
 */
function loadModel(callback) { //Load stations data
    function ok() { //Trigger when one of ajax requests are V
        if(stations && card) //If all ajax requests are V
            callback();
    }
    $.getJSON('data/stations.json', function (data) { //get stations data
        stations = data;
        ok();
    });

    $.get("cardTemplate.html", function (data) { //Get cards template
        card = doT.template(data);
        ok();
    });
}

/* Search stops from a query
 * @param query should be in stop's title
 * @returns {Array} all stops found
 */
function searchStop(query) {
    var results = [];
    var i=0;
    if(lat) { //If we have the user's position
        $.each(stations, function (key, stations) {
            if (stations.nom.toLowerCase().indexOf(query.toLowerCase()) != -1) { //If the query is in the name of the station
                i++;
                stations.distance = Math.sqrt(Math.pow(stations.long / 10 - long * 100000, 2) + Math.pow(stations.lat / 10 - lat * 100000, 2)); //We add the distance to the station
                results.push(stations);
            }
        });
        results.sort(function (a, b) { //We sort the stations by distance and return the top 10 stations (for performance reasons)
            return a.distance - b.distance;
        });
        results = results.slice(0, 10);
    }
    else { //If we don't have the user's position
        $.each(stations, function (key, arret) {
            if (arret.nom.toLowerCase().indexOf(query.toLowerCase()) != -1) { //We just get the 10 first results..
                i++;
                results.push(arret);
                if (i >= 10)
                    return false;
            }
        });
    }
    return results;
}

/**
 * Return the station with the exact name
 * @param name the name of the stations
 * @returns the stop station
 */
function stopByName(name) {
    var stop=false;
    $.each(stations, function (i, arret) {
        if (arret.nom.toLowerCase() === name.toLowerCase()) {
            stop=arret;
            return false;
        }
    });
    return stop;
}

/**
 * Generate an html card from a station
 * @param stationData the data describing the station (generated by data/genData.php)
 * @returns the HTML card -> cardTemplate.html
 */
function stopToCard(stationData) {
    stationData.lignes.forEach(function(e, i) {
        switch (e.mode) {
            case 1:
                e.modeString = "métro";
                break;
            case 2:
                e.modeString = "funiculaire";
                break;
            case 3:
                e.modeString = "tram";
                break;
            default:
                e.modeString = "bus";
        }
    });
    return card(stationData);
}

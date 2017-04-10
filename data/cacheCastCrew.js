import { Media, Cast, Credit } from './connectors';
import rp from "request-promise";
import csv from "fast-csv";
var fs = require('fs');

var tmdbkey = fs.readFileSync('tmdbkey.key', 'utf8');
var idStream = fs.createReadStream("data/missingIDs.csv");

var tmdbIDs = []

var movieOptions = {
    uri: 'https://api.themoviedb.org/3/movie/',
    qs: {
        api_key: tmdbkey // -> uri + '?api_key=xxxxx%20xxxxx'
    },
    headers: {
        'User-Agent': 'Request-Promise'
    },
    json: true // Automatically parses the JSON string in the response
};

// var timerID = setInterval(someCachingFunction, 13000);

csv.fromStream(idStream)
  .on("data", function(data) {
    tmdbIDs.push(data[2]);
  })
  .on("end",function() {
    // someCachingFunction
  });

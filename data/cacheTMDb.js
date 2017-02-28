import { Media } from './connectors';
import rp from "request-promise";
import csv from "fast-csv";
var fs = require('fs');

var tmdbkey = fs.readFileSync('tmdbkey.key', 'utf8');
var idStream = fs.createReadStream("data/movieIDs.csv");

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

var globalIndex = 1

var getMovie = function(id) {
  movieOptions.uri = "https://api.themoviedb.org/3/movie/" + id
  rp(movieOptions)
    .then((res) => {
      res.id = res.imdb_id;
      Media.create(res);
      console.log("Request successful for TMDb id: " + id)
    }).catch(function (err) {
      console.log("Requst failed for TMDb id: " + id);
    });
}

var getMovieBatch = function() {
  var index = globalIndex;
  while(index<globalIndex+40) {
    console.log(tmdbIDs[index]);
    getMovie(tmdbIDs[index]);
    index++;
  }
  globalIndex = index;
  console.log(globalIndex);
}

var timerID = setInterval(getMovieBatch, 11000);

csv.fromStream(idStream)
  .on("data", function(data) {
    tmdbIDs.push(data[2]);
  })
  .on("end",function() {
    console.log(tmdbIDs);
    getMovieBatch(globalIndex)
  });

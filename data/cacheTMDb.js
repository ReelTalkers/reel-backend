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
var unsuccessfulRequests = []

var getMovie = function(id) {
  movieOptions.uri = "https://api.themoviedb.org/3/movie/" + id
  rp(movieOptions)
    .then((res) => {
      res.id = res.imdb_id;
      res.tmdb_average = res.vote_average;
      res.tmdb_votes = res.vote_count;
      Media.create(res);
      console.log("Request successful for TMDb id: " + id)
    }).catch(function (err) {
      console.log("Requst failed for TMDb id: " + id);
      unsuccessfulRequests.push(id);
    });
}

var getMovieBatch = function() {
  var index = globalIndex;
  while(index<globalIndex+40 && globalIndex<tmdbIDs.length) {
    console.log("Current ID: " + tmdbIDs[index]);
    getMovie(tmdbIDs[index]);
    index++
  }
  globalIndex = index;
  console.log("Global index: " + globalIndex);
  if(globalIndex>=tmdbIDs.length) {
    clearInterval(timerID);
    setTimeout(function() {
      fs.writeFile("unsuccessfulRequests.txt", unsuccessfulRequests, function(err) {
        if(err) {
          return console.log(err);
        }
        console.log("The file was saved!");
      });
    }, 15000)
  }
}

var timerID = setInterval(getMovieBatch, 11000);

csv.fromStream(idStream)
  .on("data", function(data) {
    tmdbIDs.push(data[2]);
  })
  .on("end",function() {
    getMovieBatch(globalIndex)
  });

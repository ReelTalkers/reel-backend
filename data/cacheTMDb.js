import { Media } from './connectors';
import rp from "request-promise";
import csv from "fast-csv";
import { TMDB_KEY } from '../keys.js';
var fs = require('fs');

var tmdbkey = TMDB_KEY;
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

var globalIndex = 1
var unsuccessfulRequests = []

var getMovie = function(id) {
  movieOptions.uri = "https://api.themoviedb.org/3/movie/" + id
  rp(movieOptions)
    .then((res) => {
      var genres = [];
      for(var genreId in res.genres) {
         var genre = res.genres[genreId]
         genres.push(genre["name"]);
      }
      res.genres = genres;
      var production_companies = [];
      for(var companyId in res.production_companies) {
         var company = res.production_companies[companyId]
         production_companies.push(company.name);
      }
      res.production_companies = production_companies;
      res.id = res.imdb_id;
      res.tmdb_average = res.vote_average;
      res.tmdb_votes = res.vote_count;
      console.log(res);
      Media.create(res).catch((error) => {
	console.log("--- ERROR ---  \n" + error);
        //console.log("--- ERROR ---  \nMessaage: " + error.errors[0].message + "\nField: " + error.errors[0].path + "\nValue: " + error.errors[0].value);
      });
      console.log("Request successful for TMDb id: " + id)
    }).catch(function (err) {
      console.log("Requst failed for TMDb id: " + id + "\n" + err);
      unsuccessfulRequests.push(id);
    });
}

var getMovieBatch = function() {
  var index = globalIndex;
  while(index<globalIndex+40 && index<tmdbIDs.length) {
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

var timerID = setInterval(getMovieBatch, 13000);

csv.fromStream(idStream)
  .on("data", function(data) {
    tmdbIDs.push(data[2]);
  })
  .on("end",function() {
    getMovieBatch();
  });

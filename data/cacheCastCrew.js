import { Media, Cast, Crew, Person } from './connectors';
import rp from "request-promise";
import csv from "fast-csv";
var fs = require('fs');
var Promise = require("bluebird");

var tmdbkey = fs.readFileSync('tmdbkey.key', 'utf8');
var idStream = fs.createReadStream("data/movieIDs.csv");

var ids = []
var globalIndex = 1
var intervalId = null

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

// Return a promise telling whether a movie is present in the db. Uses imdbID
var checkMovie = function(idPair) {
  return Media.findById(("tt" + idPair[0]))
    .then((media) => {
      return (null!==media);
    });
}

var findCredits = function(tmdbId) {
  movieOptions.uri = "https://api.themoviedb.org/3/movie/" + tmdbId + "/credits";
  return rp(movieOptions);
}

var parseCrew = function(credits) {
  var crew = credits.crew.map((crewMember) => {
    return {
      department: crewMember.department,
      job: crewMember.job,
      personId: crewMember.id,
      mediaId: credits.id,
      name: crewMember.name,
      profile_path: crewMember.profile_path
    }
  });
  return crew;
}

var parseCast = function(credits) {
  var cast = credits.cast.map((castMember) => {
    return {
      character: castMember.character,
      order: castMember.order,
      personId: castMember.id,
      mediaId: credits.id,
      name: castMember.name,
      profile_path: castMember.profile_path
    }
  });
  return cast;
}

var createPersonReturnCredit = function(credit) {
  var returnCredit = function() {
    return credit;
  }
  return function(person) {
    if(!person) {
      return Person.create({id: credit.personId, name: credit.name, profile_path: credit.profile_path})
        .then(returnCredit);
    } else {
      return credit;
    }
  }
}

var checkPersonExists = function(credit) {
  return Person.findById(credit.personId)
    .then(createPersonReturnCredit(credit));
}

var createCrew = function(crew) {
  return Crew.create(crew)
    .catch(function(err) {
      console.log("----- ERROR ----- : " + err);
    });
}

var logError = function(cast) {
  return function(err) {
    console.log("----- ERROR ----- : " + err);
    console.log("--- Cast --- : " + cast);
  }
}
var createCast = function(cast) {
  return Cast.create(cast)
    .catch(logError(cast));
}

var cacheCredits = function(tmdbID) {
  var credits = findCredits(tmdbID);
  var crew = credits.then(parseCrew);
  var cast = credits.then(parseCast);
  crew.then(checkPersonExists)
    .then(createCrew);
  cast.then(checkPersonExists)
    .then(createCast);
}

var cachingLoop = function(ids) {
  var currentIndex = globalIndex;
  while(globalIndex<currentIndex+40 && globalIndex<ids.length) {
    cacheCredits(ids[globalIndex][1]);
    globalIndex = globalIndex + 1;
  }

  if(globalIndex>=ids.length)
    clearInterval(intervalId);
}

var cacheAllCredits = function(ids) {
  ids = Promise.filter(ids, checkMovie);
  ids.then((ids) => {
    intervalId = setInterval(cachingLoop, 13000);
    cachingLoop(ids);
  })
}

csv.fromStream(idStream)
  .on("data", function(data) {
    ids.push([data[1], data[2]]);
  })
  .on("end",function() {
    cacheAllCredits(ids);
  });

import { Media, Cast, Crew, Person } from './connectors';
import rp from "request-promise";
import csv from "fast-csv";
var fs = require('fs');
var Promise = require("bluebird");
import { TMDB_KEY } from '../keys.js';

var tmdbkey = TMDB_KEY;
var idStream = fs.createReadStream("data/movieIDs.csv");

var ids = []
var globalIndex = 0
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

var parseCrew = function(imdbID) {
  return function(credits) {
    var crew = credits.crew.map((crewMember) => {
      return {
        id: crewMember.credit_id,
        department: crewMember.department,
        job: crewMember.job,
        personId: crewMember.id,
        mediaId: ("tt" + imdbID),
        name: crewMember.name,
        profile_path: crewMember.profile_path
      }
    });
    return crew;
  }
}

var parseCast = function(imdbID, creditsPromise) {
  return function() {
    return creditsPromise.then((credits) => {
      var cast = credits.cast.map((castMember) => {
        return {
          id: castMember.credit_id,
          character: castMember.character,
          order: castMember.order,
          personId: castMember.id,
          mediaId: ("tt"+imdbID),
          name: castMember.name,
          profile_path: castMember.profile_path
        }
      });
      return cast;
    });
  }
}

var createPersonIfMissing = function(credit) {
  return function(person) {
    if(!person) {
      return Person.create({id: credit.personId, profile_path: credit.profile_path, name: credit.name});
    }
  }
}

var createAllCrew = function(crew) {
  return function() {
    if(crew.length>0) {
      var crewMember = crew.pop();
      return Person.findById(crewMember.personId)
        .then(createPersonIfMissing(crewMember))
        .then(createCrewMember(crewMember))
        .then(createAllCrew(crew))
    } else {
      return true
    }
  }
}

var createAllCast = function(cast) {
  return function() {
    if(cast.length>0) {
      var castMember = cast.pop();
      return Person.findById(castMember.personId)
        .then(createPersonIfMissing(castMember))
        .then(createCastMember(castMember))
        .then(createAllCast(cast))
    } else {
      return true
    }
  }
}

var createCrewMember = function(crewMember) {
  return function() {
    Crew.create(crewMember)
      .then((res) => {
        console.log("------ CREW MEMBER CREATED SUCCESSFULLY ------")
      })
      .catch(logError(crewMember));
  }
}

var createCastMember = function(castMember) {
  return function() {
    Cast.create(castMember)
      .then((res) => {
        console.log("------ CAST MEMBER CREATED SUCCESSFULLY ------")
      })
      .catch(logError(castMember));
  }
}

var logError = function(value) {
  return function(err) {
    //console.log("----- ERROR ----- : " + err);
    //console.log("--- Value --- : " + value);
  }
}

var cacheCredits = function(tmdbID, imdbID) {
  var credits = findCredits(tmdbID);
  credits.then(parseCrew(imdbID))
    .then((crew) => createAllCrew(crew)())
    .then(parseCast(imdbID, credits))
    .then((cast) => createAllCast(cast)());
}

var otherCaching = function() {
  intervalId = setInterval(cachingLoop, 1000);
  cachingLoop()
}

var cachingLoop = function() {
  cacheCredits(ids[globalIndex][1], ids[globalIndex][0]);
  globalIndex = globalIndex + 1;

  if(globalIndex>=ids.length)
    clearInterval(intervalId);
}

var cacheAllCredits = function() {
  Promise.filter(ids, checkMovie)
    .then((filteredIDs) => {
      ids = filteredIDs
      otherCaching();
    })
}

csv.fromStream(idStream)
  .on("data", function(data) {
    ids.push([data[1], data[2]]);
  })
  .on("end",function() {
    cacheAllCredits();
  });

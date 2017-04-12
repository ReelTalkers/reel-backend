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

var parseCrew = function(imdbID) {
  return function(credits) {
    var crew = credits.crew.map((crewMember) => {
      return {
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

var parseCast = function(imdbID) {
  return function(credits) {
    var cast = credits.cast.map((castMember) => {
      return {
        character: castMember.character,
        order: castMember.order,
        personId: castMember.id,
        mediaId: ("tt"+imdbID),
        name: castMember.name,
        profile_path: castMember.profile_path
      }
    });
    return cast;
  }
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

var logError = function(value) {
  return function(err) {
    console.log("----- ERROR ----- : " + err.parent.code);
    console.log("--- Value --- : " + value.mediaId);
  }
}

var createCrew = function(crew) {
  crew.forEach((crewMember) => {
    Crew.create(crewMember)
      .then((res) => {
        console.log("------ CREW CREATED SUCCESSFULLY ------")
      })
      .catch(logError(crewMember));
  });
}

var createCast = function(cast) {
  cast.forEach((castMember) => {
    Cast.create(castMember)
      .then((res) => {
        console.log("------ CAST CREATED SUCCESSFULLY ------")
      })
      .catch(logError(castMember));
  });
}

var cacheCredits = function(tmdbID, imdbID) {
  var credits = findCredits(tmdbID);
  var crew = credits.then(parseCrew(imdbID));
  var cast = credits.then(parseCast(imdbID));
  crew = Promise.map(crew, checkPersonExists)
    .then(createCrew);
  cast = Promise.map(cast, checkPersonExists)
    .then(createCast);
}

var otherCaching = function(ids) {
  intervalId = setInterval(cachingLoop, 13000);
  cachingLoop(ids)
}

var cachingLoop = function(ids) {
  var currentIndex = globalIndex;
  while(globalIndex<currentIndex+40 && globalIndex<ids.length) {
    cacheCredits(ids[globalIndex][1], ids[globalIndex][0]);
    globalIndex = globalIndex + 1;
  }

  if(globalIndex>=ids.length)
    clearInterval(intervalId);
}

var cacheAllCredits = function(ids) {
  ids = Promise.filter(ids, checkMovie);
  ids.then((ids) => {
    otherCaching(ids);
  })
}

csv.fromStream(idStream)
  .on("data", function(data) {
    ids.push([data[1], data[2]]);
  })
  .on("end",function() {
    cacheAllCredits(ids);
  });

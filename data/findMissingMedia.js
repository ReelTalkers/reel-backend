import { Media } from './connectors';
import csv from "fast-csv";
var fs = require('fs');

var idStream = fs.createReadStream("data/movieIDs.csv");

var missingIDs = [];
var i = 0;

csv.fromStream(idStream)
  .on("data", function(data) {
    var imdbID = "tt" + str(data[1]);
    i = i+1;
    if(i<200) {
      Media.findById(imdbID)
        .then((media) -> {
          if(media==null) {
            missingIDs+=data;
          }
        })
    }
  });

console.log(missingIDs);

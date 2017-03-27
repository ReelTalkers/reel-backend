import { Media } from './connectors';
import csv from "fast-csv";
var fs = require('fs');

var idStream = fs.createReadStream("data/movieIDs.csv");

var missingIDs = [];
var i = 0;

csv.fromStream(idStream)
  .on("data", function(data) {
    var imdbID = "tt" + data[1];
    i = i+1;
    if(i>1) {
      Media.findById(imdbID)
        .then((media) => {
          if(media==null) {
            missingIDs.push(data);
          }
        })
    }
  });

setTimeout(function() {
  var csvContent = "data:text/csv;charset=utf-8,\n";
  missingIDs.forEach(function(infoArray, index) {
   var dataString = infoArray.join(",");
   csvContent += index < missingIDs.length ? dataString+ "\n" : dataString;
  });
  fs.writeFile("data/missingIDs.csv", csvContent, function(err) {
    if(err) {
      return console.log(err);
    }
    console.log("The file was saved!");
  });
}, 30000)

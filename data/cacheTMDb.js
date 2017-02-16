import { Media } from './connectors';
import rp from "request-promise";
var fs = require('fs');

var tmdbkey = fs.readFileSync('tmdbkey.key', 'utf8');

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

console.log(tmdbkey);

movieOptions.uri = "https://api.themoviedb.org/3/movie/" + 8844
rp(movieOptions)
  .then((res) => {
    console.log(Media.create(res));
  });

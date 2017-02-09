function randomPoster() {
  var posters = [
    "http://static-api.guidebox.com/thumbnails_movies/27682-5640037493-1455436740-3276466746-large-400x570.jpg",
    "http://static-api.guidebox.com/thumbnails_movies/32662-423843926-3491966571-6241333475-large-400x570.jpg",
    "http://static-api.guidebox.com/thumbnails_movies/38364-2621611511-915332591-1069762991-large-400x570.jpg",
    "http://static-api.guidebox.com/091716/thumbnails_movies/143443-1020246265-3066121503-2609630567-large-400x570.jpg",
    "http://static-api.guidebox.com/091716/thumbnails_movies/148278-998363262-3303433228-2878751769-large-400x570.jpg"
  ]
  return posters[Math.floor(Math.random()*posters.length)];
}

function randomRating() {
  var ratings = ["R", "PG-13", "PG", "G", "Mitch Baller Approved"];
  return ratings[Math.floor(Math.random()*ratings.length)];
}

export { randomPoster, randomRating };

# Reel Backend

## Setup
```sh
npm install
```

## Run
```sh
npm start
```

## Cache Data from TMDb
Before running the following commands, add a tmdbkey.key folder containing your tmdbkey to the root of reel-backend. In addition, you must run the backend once to create the necessary tables before you can add any data to them. Every table besides media is currently overwritten when you build, which means any movies you cache from TMDb will persist through builds. For local testing, you should quit the script manually, as you don't want to cache the entire set of movies in the movielens database.
```sh
npm run-script cache_data
```

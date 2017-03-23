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

## Queries and Mutations
All graphQL object types, queries and mutations are detailed in data/schema.js. 

Object Types are formatted as follows
```js
type TypeName {
  propertyName: dataType
  propertyName: dataType
}
```
For example:
```js
type Person {
  id: ID!
  firstName: String
  lastName: String
}
```

Queries are formatted as follows
```js
type Query {
  queryName(arg1: argType, arg2: argType): returnType
  queryName(arg1: argType, arg2: argType): [returnType]   // List of returnType
}
```
For example:
```js
type Query {
  user(userName: String): User
  users: [User]
  search_media(title: String): [Media]
}
```

Mutations are formatted as follows (you optionally make them return something)
```js
type Mutation {
  mutationName (
    arg1: argtype
    arg2: argtype
  ): returnType
}
```
For example (returning the review you just made to confirm it was successfully created)
```js
type Mutation {
  createReview (
    userId: ID
    mediaId: ID
    score: Int
  ): Review
}
```

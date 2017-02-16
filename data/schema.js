import { makeExecutableSchema } from 'graphql-tools';

import resolvers from './resolvers';

const schema = `
# scalar PhoneNumber # TODO: implement
# scalar Email # TODO: implement
# scalar Password # TODO: Should we actually store the password as something that is queryable?
#
# enum Genre {
#   COMEDY
#   DRAMA
#   INDIE
# }
#
# enum Language {
#   ENGLISH
#   JAPANESE
# }
#
# enum MediaType {
#   SHOW
#   MOVIE
# }
scalar GraphQLEmail
scalar GraphQLURL
scalar GraphQLDateTime
scalar GraphQLLimitedString
scalar GraphQLPassword

type User {
  id: ID!
  userName: String
  firstName: String
  lastName: String
  # password: Password
  # isActive: Boolean!
  # lastLogin: Date
  dateJoined: GraphQLDateTime
  # private: Boolean
}

# # Profile of someone who has been associated with shows
type Person {
  id: ID!
  firstName: String
  lastName: String
}
#
type Media {
   id: ID!
   imdb: String
   title: String
   poster_120x171: String
   poster_240x342: String
   poster_400x570: String
   release_date: String
   rating: String
#   plot: String
#   full_plot: String
#   genres: [Genre]
#   directors: [Person]
#   writers: [Person]
#   banner: String
#   year: Int
#   rating: Float # TODO: Implement
#   runtime: Float
#   cast: [Person]
#   metacritic: Float
#   imdb_rating: Float
#   imdb_votes: Int
#   language: [Language]
#   last_updated: Date
#   type: MediaType
 }
#
# type Review {
#   id: ID!
#   score: Rating
#   media: Media
#   user: User
# }

# the schema allows the following query:
type Query {
  user(userName: String): User
  users: [User]
  people: [Person]
  media: [Media]
  movie(id: ID): Media
  movies: [Media]
  search(query: String): [Media]
}

# this schema allows the following mutation:
type Mutation {
  createUser (
    userName: String
    firstName: String
    lastName: String
    email: String
  ): User
}

# we need to tell the server which types represent the root query
# and root mutation types. We call them RootQuery and RootMutation by convention.
schema {
  query: Query
  mutation: Mutation
}
`;

export default makeExecutableSchema({
  typeDefs: schema,
  resolvers,
});

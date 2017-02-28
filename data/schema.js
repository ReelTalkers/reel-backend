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

enum SourceType {
  SUBSCRIPTION
  PAID
}

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

# Where you can watch a movie
type Source {
  name: String
  link: String
  type: SourceType
}
#
type Media {
   backdrop_path: String
   budget: Int
   cast: [Person]
   directors: [Person]
   id: ID!
   genres: [String]
   original_language: String
   overview: String
   poster_path: String
   production_companies: [String]
   release_date: String
   revenue: Int
   runtime: Int
   sources: [Source]
   status: Boolean
   tagline: String
   title: String
   writers: [Person]

#   plot: String
#   full_plot: String
#   genres: [Genre]
#   banner: String
#   rating: Float # TODO: Implement
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

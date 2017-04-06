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
  reviews: [Review]
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
   revenue: String
   reviews: [Review]
   runtime: Int
   sources: [Source]
   status: Boolean
   tagline: String
   title: String
   tmdb_average: Float
   tmdb_votes: Int
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
type Review {
   id: ID!
   score: Int
   media: Media
   user: User
}

# the schema allows the following query:
type Query {
  # Query uses id by default, but will resort to userName if id is not specified
  user(id: String, userName: String): User
  users: [User]
  people: [Person]
  all_media: [Media]
  media(id: String): Media
  search_media(title: String): [Media]
  recommendations(userId: String): [Media]
  group_recommendations(userIds: [String], genre: String, quantity: Int): [Media]
}

# this schema allows the following mutation:
type Mutation {
  createReview (
    userId: ID
    mediaId: ID
    score: Int
  ): Review
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

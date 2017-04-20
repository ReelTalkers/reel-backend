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
  fullName: String
  email: String
  reviews: [Review]
  dateJoined: GraphQLDateTime
  smallPhoto: String
  fbID: String
  completedWalkthrough: Boolean
  groupMembers: [User]
  # private: Boolean
}

# # Profile of someone who has been associated with shows
type Person {
  id: ID!
  name: String
  profile_path: String
  roles: [Cast]
  credits: [Crew]
}

type Cast {
  character: String
  order: Int
  media: Media
  person: Person
}

type Crew {
  department: String
  job: String
  media: Media
  person: Person
}

# Where you can watch a movie
type Source {
  name: String
  link: String
  type: String
  price: Float
}
#
type Media {
   backdrop_path: String
   budget: Int
   cast(limit: Int): [Cast]
   directors: [Crew]
   id: ID!
   genres: [String]
   original_language: String
   overview: String
   poster_path: String
   production_companies: [String]
   release_date: String
   revenue: String
   review: Review
   reviews: [Review]
   runtime: Int
   similar_movies(quantity: Int): [Media]
   sources: [Source]
   status: Boolean
   tagline: String
   title: String
   tmdb_average: Float
   tmdb_votes: Int
   writers: [Crew]

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

type Genre {
  name: String
  media: [Media]
}

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
  current_user: User
  users: [User]
  cast: [Cast]
  crew: [Crew]
  people: [Person]
  all_media(limit: Int, offset: Int): [Media]
  media(id: String): Media
  search_media(title: String): [Media]
  recommendations(userIds: [String], genres: [String], quantity: Int): [Genre]
  search_users(username: String): [User]
  logged_in: Boolean
}

# this schema allows the following mutation:
type Mutation {
  reviewMedia (
    mediaId: ID
    score: Int
  ): Review
  createUser (
    userName: String
    fullName: String
    email: String
  ): User
  addUserToGroup(
    id: ID
  ): [User]
  removeUserFromGroup(
    id: ID
  ): [User]
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

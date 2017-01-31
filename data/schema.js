import { makeExecutableSchema } from 'graphql-tools';

import resolvers from './resolvers';

const schema = `
type Author {
  id: Int! # the ! means that every author object _must_ have an id
  firstName: String
  lastName: String
  posts: [Post] # the list of Posts by this author
}

scalar Date
scalar PhoneNumber # TODO: implement
scalar Email # TODO: implement
scalar Password # TODO: Should we actually store the password as something that is queryable?

type User {
  id: Int!
  username: String
  firstName: String
  lastName: String
  password: Password
  phone: PhoneNumber
  email: Email
  isActive: Boolean!
  lastLogin: Date
  dateJoined: Date
}

# Profile of someone who has been associated with shows
type Person {
  id: Int!
  firstName: String
  lastName: String
}

# the schema allows the following query:
type Query {
  posts: [Post]
}

# this schema allows the following mutation:
type Mutation {
  upvotePost (
    postId: Int!
  ): Post
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

const { ApolloServer, PubSub } = require('apollo-server')
const typeDefs = require('./schema')
// const resolvers = require('./resolvers')
const models = require('../models')
const { gql } = require('apollo-server');
const Query = require('./resolvers/Query');
const Mutation = require('./resolvers/Mutation');
const Subscription = require('./resolvers/Subscription');
const User = require('./resolvers/User');
const Link = require('./resolvers/Link');
const Vote = require('./resolvers/Vote');
const Title = require('./resolvers/Title');
const Story = require('./resolvers/Story');

const pubsub = new PubSub();
const resolvers = {
  Query,
  Mutation,
  Subscription,
  User,
  Link,
  Vote,
  Title,
  Story
}

console.log("types is" + typeDefs);
const server = new ApolloServer({
  typeDefs: typeDefs,
  resolvers,
  context: request => {
    return {
      ...request,
      models,
      pubsub
    }
  }
})

server
  .listen()
  .then(({ url }) => console.log('Server is running on localhost:4000'))
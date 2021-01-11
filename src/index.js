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
//const Vote = require('./resolvers/Vote');
const Title = require('./resolvers/Title');
const Story = require('./resolvers/Story');
const Rating = require('./resolvers/Ratings');
const pubsub = new PubSub();
const resolvers = {
  Query,
  Mutation,
  Subscription,
  User,
  Title,
  Story,
  Rating
}

console.log("types is" + typeDefs);
const server = new ApolloServer({
  typeDefs: typeDefs,
  resolvers,
  debug: false,
  formatError: (err) => {
    // Don't give the specific errors to the client.    

    if (err.type == "validation error") {
      return err;
    }
    else if(err.originalError !== undefined) {
      if (err.originalError.name == 'SequelizeValidationError') {
        err.extensions.errorString = {};
        err.extensions.errorString.message = "database validation Error";
        err.extensions.errorString.errors = err.originalError.errors.map(x => {
          let obj = {};
          if (x.message !== undefined) {
            obj.message = x.message
          }
          if (x.path !== undefined) {
            obj.path = x.path
          }
          if (x.value !== undefined) {
            obj.value = x.value;
          }
          return obj
        })
        console.log(err.extensions.errorString);
        return err.extensions.errorString;
      }
      else if (err.originalError.name == 'SequelizeUniqueConstraintError') {
        err.extensions.errorString = {};
        err.extensions.errorString.message = "Unique Key Error";
        err.extensions.errorString.errors = err.originalError.errors.map(x => {
          let obj = {};
          if (x.message !== undefined) {
            obj.message = x.message
          }
          if (x.path !== undefined) {
            obj.path = x.path
          }
          if (x.value !== undefined) {
            obj.value = x.value;
          }
          return obj
        })
        return err.extensions.errorString;
      }
      else{
        return err;
      }
    }
    else if(err.name = "GraphQLError"){
      return err;
    }

    return err;
    // Otherwise return the original error.  The error can also    
    // be manipulated in other ways, so long as it's returned.

  },
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
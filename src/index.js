const { ApolloServer, PubSub } = require('apollo-server')
const express = require('express');
// const { GraphQLLocalStrategy, buildContext } = 'graphql-passport';
const passport = require('passport');
// const { GraphQLLocalStrategy } = require('graphql-passport');
const Users = require('../models/user').User;
const app = express();

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

const PORT = 4000;
const SESSION_SECRECT = 'bad secret';

// const facebookOptions = {
//   clientID: process.env.FACEBOOK_APP_ID,
//   clientSecret: process.env.FACEBOOK_APP_SECRET,
//   callbackURL: 'http://localhost:4000/auth/facebook/callback',
//   profileFields: ['id', 'email', 'first_name', 'last_name'],
// };

// const facebookCallback = (accessToken, refreshToken, profile, done) => {
//   Users.findOne({
//     where: {
//       profileId: profile.id,
//       type:'facebook'
//     }
//   })
//     .then(userDb => {
//       if (userDb) {
//         const token = jwt.sign({ userId: userDb.id }, APP_SECRET);
//         done(null, {user:userDb,token:token});
//       }
//       else {
//         return User.create({
//           facebookId: profile.id,
//           name: profile.name.givenName,
//           email: profile.emails && profile.emails[0] && profile.emails[0].value
//         })
//       }
//     })
//     .then(newUserDb => {
//       const token = jwt.sign({ userId: newUserDb.id }, APP_SECRET);
//       done(null, {user:newUserDb,token:token});
//     })
//     .catch(e)


// };

// passport.use(new FacebookStrategy(
//   facebookOptions,
//   facebookCallback,
// ));

// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser((id, done) => {
//   const users = User.getUsers();
//   const matchingUser = users.find(user => user.id === id);
//   done(null, matchingUser);
// });

// app.use(session({
//   genid: (req) => uuid(),
//   secret: SESSION_SECRECT,
//   resave: false,
//   saveUninitialized: false,
// }));

// app.use(passport.initialize());
// app.use(passport.session());




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
    else if (err.originalError !== undefined) {
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
      else {
        return err;
      }
    }
    else if (err.name = "GraphQLError") {
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
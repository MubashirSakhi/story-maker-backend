const { gql } = require('apollo-server')

const typeDefs = gql`
    type User {
        id: Int!
        name: String!
        email: String!
        recipes: [Recipe!]!
        Links:[Link!]!
        Title:[Title!]

      }
    type Title{
      id:Int!
      name:String!
      background:String!
      Stories:[Story!]
      author:User
    }
    type Story{
      id:Int!
      Story: Story
      contributor:User
      Ratings:[Rating!]
    }  
    type AuthPayload {
        token: String
        user: User
      }
      
    type Recipe {
        id: Int!
        title: String!
        ingredients: String!
        direction: String!
        user: User!
    }
    type Link {
        id: ID!
        description: String!
        url: String!
        postedBy:User,
        votes: [Vote!]!
      }
    type Vote {
      id: ID!
      link: Link!
      user: User!
    }
    type Feed {
      links: [Link!]!
      count: Int!
    }
    input LinkOrderByInput {
      description: Sort
      url: Sort
      createdAt: Sort
    }
    
    enum Sort {
      ASC
      DESC
    }
    type Query {
        user(id: Int!): User
        allRecipes: [Recipe!]!
        recipe(id: Int!): Recipe
        info: String!
        feed(filter:String,skip:Int,limit:Int,orderBy: LinkOrderByInput): Feed!
        getLink(id: ID!): Link
        getTitles:[Title!]!
    }
    type Subscription{
      newLink: Link
      newVote: Vote
    }
    type Mutation {
        createUser(name: String!, email: String!, password: String!): User!
        createRecipe(
          userId: Int!
          title: String!
          ingredients: String!
          direction: String!
        ): Recipe!
        
        signup(email: String!, password: String!, name: String!): AuthPayload
        
        login(email: String!, password: String!): AuthPayload
        
        createLink(url:String, description:String, postedBy:Int): Link!
        # Update a link
        updateLink(id: ID!, url: String, description: String): Link!
      
        # Delete a link
        deleteLink(id: ID!): Boolean
        #Create Vote
        vote(linkId: ID!): Vote
    }
    
      
      
`

module.exports = typeDefs
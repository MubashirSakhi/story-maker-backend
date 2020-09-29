const { gql } = require('apollo-server')

const typeDefs = gql`
    scalar Date    
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
      createdAt: Date
      Stories:[Story!]
      author:User
    }
    type Story{
      id:Int!
      story: String
      createdAt:Date
      contributor:User
      Ratings:[Rating!]
      totalRating:Float
    }
    type Feed {
      links: [Link!]!
      count: Int!
    }
    type TitleFeed {
      titles:[Title]!
      count: Int!
    }
    type StoryFeed{      
      stories: [Story!]!
      count: Int!
    } 
    type Rating{
      id:Int!
      value:Int!
      comment:String
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
        createdAt:Date
        postedBy:User,
        votes: [Vote!]!
      }
    type Vote {
      id: ID!
      link: Link!
      user: User!
      createdAt:Date
    }
    
    input LinkOrderByInput {
      description: Sort
      url: Sort
      createdAt: Sort
    }
    input TitleOrderByInput{
      name:Sort
      background:Sort
      createdAt:Sort
    }
    input StoryOrderByInput{
      story:Sort
      createdAt:Sort
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
        getTitles(filter:String,skip:Int,limit:Int):TitleFeed!
        getTitlesByUser:[Title]!
        getTitle(id:Int): Title!   
        getStories(id:Int!,filter:String,skip:Int,limit:Int):StoryFeed!
        getStory(id:Int!):Story 
    }
    type Subscription{
      newLink: Link
      newVote: Vote
      newTitle: Title
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
        #createTitle
        createTitle(name:String,background:String):Title
        
        updateTitle(name:String,background:String):Title
        
        deleteTitle(id:Int!): Boolean 
        
        createStory(story:String!,titleId:Int!):Story
        
        updateStory(story:String!,storyId:Int!):Story 
        
        deleteStory(storyId:Int!):Boolean
        
        createRating(value:Int!,storyId:Int!,comment:String):Rating
        
        deleteRating(id:Int): Boolean
      }
    
      
      
`

module.exports = typeDefs
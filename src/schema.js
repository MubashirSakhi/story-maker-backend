const { gql } = require('apollo-server')

const typeDefs = gql`
    scalar Date    
    type User {
        id: Int!
        name: String!
        email: String!
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
      titleId:Int!
      contributor:User
      Ratings:[Rating!]
      totalRating:Float
    }
   
    type TitleFeed {
      titles:[Title]!
      count: Int!
    }
    type StoryFeed{      
      stories: [Story!]!
      count: Int!
    } 
    type UserStories{
      stories:[Story!]!
      
    }
    type Rating{
      id:Int!
      value:Int!
      comment:String,
      ratedBy:User
    } 
    type AuthPayload {
        token: String
        user: User
      }
      input AuthInput {
        accessToken: String!
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
        info: String!
        # feed(filter:String,skip:Int,limit:Int,orderBy: LinkOrderByInput): Feed!
        # getLink(id: ID!): Link
        getTitles(filter:String,skip:Int,limit:Int):TitleFeed!
        getTitlesByUser:[Title]!
        getTitle(id:Int): Title!   
        getStories(id:Int!,filter:String,skip:Int,limit:Int):StoryFeed!
        getStory(id:Int!):Story
        getStoriesByUser:[Story]! 
    }
    type Subscription{
      newTitle: Title
      newStory: Story
    }
    type Mutation {
        createUser(name: String!, email: String!, password: String!): User!
        
        signup(email: String!, password: String!, name: String!): AuthPayload
        
        login(email: String!, password: String!): AuthPayload
        authFacebook(input: AuthInput!): AuthPayload
        authGoogle(input: AuthInput!): AuthPayload
        # createLink(url:String, description:String, postedBy:Int): Link!
        # Update a link
        # updateLink(id: ID!, url: String, description: String): Link!
      
        # Delete a link
        #deleteLink(id: ID!): Boolean
        
        #createTitle
        createTitle(name:String,background:String):Title
        
        updateTitle(id:Int,name:String,background:String):Title
        
        deleteTitle(id:Int!): Boolean 
        
        createStory(story:String!,titleId:Int!):Story
        
        updateStory(story:String!,storyId:Int!):Story 
        
        deleteStory(storyId:Int!):Boolean
        
        createRating(value:Int!,storyId:Int!,comment:String):Rating
        
        deleteRating(id:Int): Boolean

        forgetPassword(email:String): String
        
        resetPasswordToken(token: String, password:String): Boolean
      }
    
      
      
`

module.exports = typeDefs
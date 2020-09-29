const { subscribe } = require("graphql")

function newLinkSubscribe(parent, args, context, info) {
    return context.pubsub.asyncIterator("NEW_LINK")
}
function newVoteSubscribe(parent, args, context, info) {
    return context.pubsub.asyncIterator("NEW_VOTE")
}
function newTitleSubscribe(parent, args, context, info) {
    return context.pubsub.asyncIterator("NEW_TITLE")
}
function newStorySubscribe(parent, args, context, info) {
    return context.pubsub.asyncIterator("NEW_STORY")
}
const newLink = {
    subscribe: newLinkSubscribe,
    resolve: payload => {
        return payload
    },
}
const newVote = {
    subscribe: newVoteSubscribe,
    resolve: payload => {
        return payload
    }

}
const newTitle = {
    subscribe: newTitleSubscribe,
    resolve: payload => {
        return payload
    }
}
const newStory = {
    subscribe: newTitleSubscribe,
    resolve: payload => {
        return payload
    }
}
module.exports = {
    newLink,
    newVote,
    newTitle
}
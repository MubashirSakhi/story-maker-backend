const { subscribe } = require("graphql")

function newTitleSubscribe(parent, args, context, info) {
    return context.pubsub.asyncIterator("NEW_TITLE")
}
function newStorySubscribe(parent, args, context, info) {
    return context.pubsub.asyncIterator("NEW_STORY")
}

const newTitle = {
    subscribe: newTitleSubscribe,
    resolve: payload => {
        return payload
    }
}
const newStory = {
    subscribe: newStorySubscribe,
    resolve: payload => {
        return payload
    }
}
module.exports = {
    newTitle,
    newStory
}
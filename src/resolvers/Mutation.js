const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { APP_SECRET, getUserId } = require('../utils');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

async function createUser(root, { name, email, password }, context) {
    return context.models.User.create({
        name,
        email,
        password: await bcrypt.hash(password, 10)
    })
}
async function createRecipe(root, { userId, title, ingredients, direction }, context) {
    console.log("model" + models);
    return context.models.Recipe.create({ userId, title, ingredients, direction })
}
async function createLink(root, { url, description, postedBy }, context) {
    const userId = getUserId(context);
    return context.models.Link.create({
        url,
        description,
        postedBy
    })
        .then(link => {
            context.pubsub.publish("NEW_LINK", link);
            return link;
        })
}

async function updateLink(root, { id, url, description }, context) {
    return context.models.Link.findByPk(id)
        .then(link => {
            link.description = description;
            link.url = url;
            return link.save();
        })
        // .then(link => {
        //     return link;
        // })
        .catch(e => {
            console.log("is it going here");
            return e.message;
        })

}
async function deleteLink(root, { id }, context) {
    return context.models.Link.destroy({ where: { id: id } }).then(() => {
        return true;
    })

}
async function signup(root, { email, password, name }, context) {
    return context.models.User.create({
        name,
        email,
        password: await bcrypt.hash(password, 10)
    })
        .then(userdb => {
            const token = jwt.sign({ userId: userdb.id }, APP_SECRET)
            return ({ user: userdb, token: token })
        })
        .catch(e => {
            return e.message;
        })
}
async function login(root, { email, password }, context) {
    return context.models.User.findOne({
        where: {
            email: email
        }
    })
        .then(userdb => {
            if (userdb.validPassword(password)) {
                const token = jwt.sign({ userId: userdb.id }, APP_SECRET)
                return ({ user: userdb, token: token })
            }
            else {
                throw new Error("Email or Password is incorrect")
            }
        })
        .catch(e => {
            throw e;
        })
}
async function vote(root, { linkId }, context) {
    const userId = getUserId(context);
    return context.models.Vote.findOne({
        where: {
            linkId: linkId,
            votedBy: userId
        }
    })
        .then(vote => {
            if (vote) {
                throw new Error(`Already voted for link: ${linkId}`)
            }
            else {
                return context.models.Vote.create({
                    linkId: linkId,
                    votedBy: userId
                })
            }
        })
        .then(voted => {
            context.pubsub.publish("NEW_VOTE", voted)
            return voted;
        })
}
async function createTitle(root, { name, background }, context) {
    let userId = getUserId(context);
    return context.models.Title.create({
        author: userId,
        name: name,
        background: background !== null ? background : null
    })
        .then(titleDb => {
            context.pubsub.publish("NEW_TITLE", titleDb);
            return titleDb;
        })
        .catch(err => {
            return err
        })
}
async function updateTitle(root, { id, name, background }, context) {
    let userId = getUserId(context);
    return context.models.Title.findOne({
        where: {
            id: id,
            author: userId
        }
    })
        .then(titleDb => {
            if (name !== undefined) {
                titleDb.name = name;
            }
            if (background !== undefined) {
                titleDb.background = background;
            }
            return titleDb.save()
        })
}
async function deleteTitle(root, { id }, context) {
    let userId = getUserId(context);
    // write logic to delete rating and stories too 
    return context.models.Title.destroy({
        where: {
            id: id,
            author: userId
        }
    })
        .then(() => {
            return true;
        })

}
async function createStory(root, { story, titleId }, context) {
    let userId = getUserId(context);
    return context.models.Story.create({
        story: story,
        titleId: titleId,
        contributor: userId
    })
    .then(storyDb => {
        context.pubsub.publish("NEW_STORY", storyDb);
        return storyDb;
    })
    .catch(err => {
        return err
    })
}
async function updateStory(root, { id, story }, context) {
    let userId = getUserId(context);
    return context.models.Story.findOne({
        where: {
            id: id,
            contributor: userId
        }
    })
        .then(storyDb => {
            if (story !== undefined) {
                storyDb.story = story;
            }
            return storyDb.save();
        })
}
async function deleteStory(root, { id }, context) {
    let userId = getUserId(context);
    return context.modes.Story.destroy({
        where: {
            id: id,
            contributor: userId
        }
    })
        .then(() => {
            return true;
        })
}
async function createRating(root, { value, storyId, comment }, context) {
    let userId = getUserId(context);
    return context.models.Rating.create({
        value: value,
        ratedBy: userId,
        storyId: storyId,
        comment: comment !== undefined ? comment : null
    })
    
}
async function deleteRating(root, { id }, context) {
    let userId = getUserId(context);
    return context.models.Rating.destroy({
        where: {
            id: id,
            ratedBy: userId
        }
    })
        .then(() => {
            return true;
        })
}
module.exports = {
    updateLink,
    deleteLink,
    createLink,
    signup,
    login,
    vote,
    createTitle,
    updateTitle,
    deleteTitle,
    createStory,
    updateStory,
    deleteStory,
    createRating,
    deleteRating
}
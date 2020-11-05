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
            throw e.message;
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
    
    signup,
    login,
    createTitle,
    updateTitle,
    deleteTitle,
    createStory,
    updateStory,
    deleteStory,
    createRating,
    deleteRating
}
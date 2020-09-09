const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { APP_SECRET, getUserId } = require('./utils');
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
                throw error
            }
        })
        .catch(e => {
            return e.message
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
module.exports = {
  updateLink,
  deleteLink,
  createLink,
  signup,
  login,
  vote,
}
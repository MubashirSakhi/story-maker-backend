const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { APP_SECRET, getUserId } = require('../utils');
const { authenticateFacebook, authenticateGoogle } = require('../passport');
const Users = require('../../models/user');
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
        provider: 'basic',
        password: await bcrypt.hash(password, 10)
    })
        .then(userdb => {
            const token = jwt.sign({ userId: userdb.id }, APP_SECRET)
            return ({ user: userdb, token: token })
        })
        .catch(e => {
            throw e;
        })
}
async function login(root, { email, password }, context) {
    return context.models.User.findOne({
        where: {
            email: email,
            provider: 'basic'
        }
    })
        .then(userdb => {
            if (userdb) {
                if (userdb.validPassword(password) && userdb.password !== null) {
                    const token = jwt.sign({ userId: userdb.id }, APP_SECRET)
                    return ({ user: userdb, token: token })
                }
                else {
                    throw new Error("Email or Password is incorrect!")
                }
            }

            else {
                throw new Error("Email or Password is incorrect!");
            }
        })
        .catch(e => {
            throw e;
        })
}
async function authFacebook(root, { input: { accessToken } }, context) {
    context.req.body = {
        ...context.req.body,
        access_token: accessToken,
    };
    try {
        // data contains the accessToken, refreshToken and profile from passport
        const { data, info } = await authenticateFacebook(context.req, context.res);

        if (data) {
            const user = await context.models.User.findOne(
                {
                    where: {
                        profileId: data.profile.id
                    }
                });
            if (!user) {
                const newUser = await context.models.User.create({
                    provider: "facebook",
                    profileId: data.profile.id,
                    email: data.profile.emails && data.profile.emails[0] && data.profile.emails[0].value,
                    name: data.profile.name.givenName,
                    token: context.req.body.accessToken
                });
                const token = jwt.sign({ userId: newUser.id }, APP_SECRET);
                return ({
                    user: newUser,
                    token: token
                })
            }
            else {
                const token = jwt.sign({ userId: user.id }, APP_SECRET);
                return ({
                    user: user,
                    token: token
                })
            }

        }

        if (info) {
            console.log(info);
            switch (info.code) {
                case 'ETIMEDOUT':
                    return (new Error('Failed to reach Facebook: Try Again'));
                default:
                    return (new Error('something went wrong'));
            }
        }
        return (Error('server error'));
    } catch (error) {
        return error;
    }
}
async function authGoogle(root, { input: { accessToken } }, context) {
    context.req.body = {
        ...context.req.body,
        access_token: accessToken,
    };

    try {
        // data contains the accessToken, refreshToken and profile from passport
        const { data, info } = await authenticateGoogle(context.req, context.res);

        if (data) {
            const user = await context.models.User.findOne({
                where: {
                    profileId: data.profile.id
                }
            });
            if (!user) {
                const newUser = await context.models.User.create({
                    provider: "google",
                    profileId: data.profile.id,
                    email: data.profile.emails && data.profile.emails[0] && data.profile.emails[0].value,
                    name: data.profile.name.givenName,
                    token: context.req.body.accessToken
                });
                const token = jwt.sign({ userId: newUser.id }, APP_SECRET);
                return ({
                    user: user,
                    token: token
                })
            }
            else {
                const token = jwt.sign({ userId: user.id }, APP_SECRET);
                return ({
                    user: user,
                    token: token
                })
            }

        }


        if (info) {
            console.log(info);
            switch (info.code) {
                case 'ETIMEDOUT':
                    return (new Error('Failed to reach Google: Try Again'));
                default:
                    return (new Error('something went wrong'));
            }
        }
        return (Error('server error'));
    } catch (error) {
        return error;
    }
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
            if (titleDb) {
                if (name !== undefined) {
                    titleDb.name = name;
                }
                if (background !== undefined) {
                    titleDb.background = background;
                }
                return titleDb.save()
            }
            else {
                throw new Error("Title does not exist");
            }

        })
        .catch(err => {
            return err;
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
        .catch(err => {
            return err;
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
async function updateStory(root, { storyId, story }, context) {
    let userId = getUserId(context);
    return context.models.Story.findOne({
        where: {
            id: storyId,
            contributor: userId
        }
    })
        .then(storyDb => {
            if (storyDb !== undefined) {
                storyDb.story = story;
            }
            return storyDb.save();
        })
        .catch(err => {
            return err;
        })
}
async function deleteStory(root, { storyId }, context) {
    let userId = getUserId(context);
    //remove any rating to this story before deleting any story
    return context.models.Story.destroy({
        where: {
            id: storyId,
            contributor: userId
        }
    })
        .then(() => {
            return true;
        })
        .catch(err => {
            return err;
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
        .catch(err => {
            return err;
        })
}
module.exports = {

    signup,
    login,
    authFacebook,
    authGoogle,
    createTitle,
    updateTitle,
    deleteTitle,
    createStory,
    updateStory,
    deleteStory,
    createRating,
    deleteRating
}
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { APP_SECRET, getUserId } = require('../utils');
const { authenticateFacebook, authenticateGoogle } = require('../passport');
const User = require('../../models').User;
const Sequelize = require('sequelize');
const token = require('../../models/token');
const Op = Sequelize.Op;

async function createUser(root, { name, email, password }, context) {
    return context.models.User.create({
        name,
        email,
        password: await bcrypt.hash(password, 10)
    })
}

async function signup(root, { email, password, name }, context) {
    try {
        const user = await context.models.User.create({
            name,
            email,
            provider: 'basic',
            password: await bcrypt.hash(password, 10)
        })
        const token = user.generateJWT();
        return ({ user: user, token: token })
    } catch (error) {
        throw error;
    }

}
async function login(root, { email, password }, context) {
    try {
        const user = await context.models.User.findOne({
            where: {
                email: email,
                provider: 'basic'
            }
        });
        if (user) {
            if (user.validPassword(password) && user.password !== null) {
                const token = user.generateJWT();
                return ({ user: user, token: token })
            }
            else {
                throw new Error("Email or Password is incorrect!")
            }
        }
        else {
            throw new Error("Email or Password is incorrect!");
        }
    } catch (error) {
        throw error;
    }

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
            const user = await User.upsertFbUser(data);
            if (user) {
                return ({
                    user: user,
                    token: user.generateJWT()
                })

            }
        }

        if (info) {
            console.log(info);
            switch (info.code) {
                case 'ETIMEDOUT':
                    throw (new Error('Failed to reach Facebook: Try Again'));
                default:
                    throw (new Error('something went wrong'));
            }
        }
        throw (Error('server error'));
    } catch (error) {
        throw error;
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
            const user = await User.upsertGoogleUser(data);
            if (user) {
                return ({
                    user: user,
                    token: user.generateJWT()
                })

            }
        }
        if (info) {
            console.log(info);
            switch (info.code) {
                case 'ETIMEDOUT':
                    throw (new Error('Failed to reach Google: Try Again'));
                default:
                    throw (new Error('something went wrong'));
            }
        }
        throw (Error('server error'));

    } catch (error) {
        throw error;
    }
}
async function createTitle(root, { name, background }, context) {
    let userId = getUserId(context);
    try {
        const title = await context.models.Title.create({
            author: userId,
            name: name,
            background: background !== null ? background : null
        })
        context.pubsub.publish("NEW_TITLE", title);
        return title;
    }
    catch (error) {
        throw error;
    }

}
async function updateTitle(root, { id, name, background }, context) {
    let userId = getUserId(context);
    try {
        const title = await context.models.Title.findOne({
            where: {
                id: id,
                author: userId
            }
        })
        if (title) {
            if (name !== undefined) {
                title.name = name;
            }
            if (background !== undefined) {
                title.background = background;
            }
            return title.save();
        }
        else {
            throw new Error("Title does not exist");
        }
    }
    catch (error) {
        throw error;
    }


}
async function deleteTitle(root, { id }, context) {
    let userId = getUserId(context);
    // write logic to delete rating and stories too 
    try {
        const deleteTitle = await context.models.Title.destroy({
            where: {
                id: id,
                author: userId
            }
        })
        return deleteTitle;
    }
    catch (error) {
        throw error;
    }

}
async function createStory(root, { story, titleId }, context) {
    let userId = getUserId(context);
    try {
        const storyDb = await context.models.Story.create({
            story: story,
            titleId: titleId,
            contributor: userId
        })
        context.pubsub.publish("NEW_STORY", storyDb);
        return storyDb;
    }
    catch (error) {
        throw error;
    }
}
async function updateStory(root, { storyId, story }, context) {
    let userId = getUserId(context);
    try {
        const storyDb = await context.models.Story.findOne({
            where: {
                id: storyId,
                contributor: userId
            }
        })
        if (storyDb) {
            storyDb.story = story;
        }
        return storyDb.save();
    }
    catch (error) {
        throw error
    }
}
async function deleteStory(root, { storyId }, context) {
    let userId = getUserId(context);
    //remove any rating to this story before deleting any story
    try {
        const story = await context.models.Story.destroy({
            where: {
                id: storyId,
                contributor: userId
            }
        })
        return true;
    }
    catch (error) {
        throw error;
    }

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
    try {
        const rating = await context.models.Rating.destroy({
            where: {
                id: id,
                ratedBy: userId
            }
        })
        return true;
    }
    catch (error) {
        throw error;
    }

}
async function forgetPassword(root, { email }, context) {
    try {
        const user = await context.models.User.findOne({
            where: {
                email: email
            }
        })
        if (!user) {
            throw new Error('User does not exist');
        }
        if (user) {
            const existingToken = await context.models.ResetToken.findOne({
                where: {
                    resetUser: user.id
                }
            })
            if (existingToken) {
                await existingToken.destroy()
            }
            const today = new Date();
            const expirationDate = new Date(today);
            expirationDate.setDate(today.getDate() + 60);
            let resetTokenJwt = jwt.sign({
                userId: user.id,
                exp: parseInt(expirationDate.getTime() / 1000, 10)
            }, process.env.APP_SECRET);
            let newResetToken = await context.models.resetToken.create({
                token: resetTokenJwt,
                resetUser: user.id
            })
            return `localhost:4000/graphql?token=${newResetToken}`;
        }
    }
    catch (error) {
        throw error
    }
}
async function resetPasswordToken(root, { token, password }, context) {
    try {
        let { userId } = jwt.verify(token, process.env.APP_SECRET);
        let passwordResetToken = await context.models.ResetToken.findOne({
            token: token,
            resetUser: userId
        });
        if (!passwordResetToken) {
            throw new Error("Invalid or expired password reset token");
        }
        else {
            let resetUser = await context.models.User.findOne({
                where: {
                    id: userId
                }
            })
            resetUser.password = bcrypt.hash(password, 10);
            await resetUser.save();
            await passwordResetToken.destroy();
            return true;
        }

    }
    catch(error){
        throw error;
    }
    

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
    deleteRating,
    forgetPassword,
    resetPasswordToken
}
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const { getUserId } = require('../utils');

async function user(root, { id }, context) {
    return context.models.User.findByPk(id)
}
async function allRecipes(root, args, context) {
    return context.models.Recipe.findAll()
}
async function recipe(root, { id }, context) {
    return context.Recipe.findByPk(id)
}
async function feed(root, { filter, skip, limit, orderBy }, context) {
    let query;
    let order = [];
    if (orderBy) {
        for (let key in orderBy) {
            order.push([key, orderBy[key]])
        }
    }
    if (filter) {
        query = {
            [Op.or]: [{
                url: {
                    [Op.like]: "%" + filter + "%"
                }
            }, {
                description: {
                    [Op.like]: "%" + filter + "%"
                }
            }],
        }
    }
    else {
        query = {};
    }
    return context.models.Link.findAndCountAll({
        where: query,
        offset: skip,
        limit: limit,
        order: order
    })
        .then(links => {
            return ({ links: links.rows, count: links.count })
        })

}
async function getLink(root, { id }, context) {
    const userId = getUserId(context);
    return context.models.Link.findByPk(id);
}
async function getTitles(root, { filter, skip, limit, orderBy }, context) {
    let query;
    let order = [];
    if (orderBy) {
        for (let key in orderBy) {
            order.push([key, orderBy[key]])
        }
    }
    if (filter) {
        query = {
            [Op.or]: [{
                name: {
                    [Op.like]: "%" + filter + "%"
                }
            }, {
                background: {
                    [Op.like]: "%" + filter + "%"
                }
            }],
        }
    }
    else {
        query = {};
    }
    return context.models.Title.findAndCountAll({
        where: query,
        offset: skip,
        limit: limit,
        order: [['createdAt','DESC']]
    })
        .then(titlesDb => {
            return ({ titles: titlesDb.rows, count: titlesDb.count })
        })
        .catch(e => {
            return e.message
        })
}
async function getTitlesByUser(root, { }, context) {
    const userId = getUserId(context);
    return context.models.Title.findAll({
        where: {
            author: userId
        }
    })

}
async function getTitle(root, { id }, context) {
    return context.models.Title.findByPk(id);
}
async function getStories(root, { id, filter, skip, limit, orderBy }, context) {
    let query;
    let order = [];
    if (orderBy) {
        for (let key in orderBy) {
            order.push([key, orderBy[key]])
        }
    }
    if (filter) {
        query = {
            titleId: id,
            story: {
                [Op.like]: "%" + filter + "%"
            }
        }
    }
    else {
        query = {
            titleId: id
        };
    }
    return context.models.Story.findAndCountAll({
        where: query,
        limit: limit,
        offset: skip,
        order: orderBy
    })
        .then(storiesDb => {
            return ({ stories: storiesDb.rows, count: storiesDb.count })
        })
        .catch(e => {
            throw e;
        })
}
async function getStory(root, { id }, context) {
    return context.models.Story.findAll({
        where: {
            id: id
        }
    })
        .then(storyDb => {
            return ({ story: storyDb })
        })
        .catch(e => {
            throw e;
        })
}
module.exports = {
    feed,
    getLink,
    getTitles,
    getTitlesByUser,
    getTitle,
    getStories,
    getStory
}
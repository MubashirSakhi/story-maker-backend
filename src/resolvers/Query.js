const Sequelize = require('sequelize');
const Op = Sequelize.Op;

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
module.exports = {
    feed,
    getLink
}
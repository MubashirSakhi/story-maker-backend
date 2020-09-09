const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { APP_SECRET, getUserId } = require('./utils');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
function newLinkSubscribe(parent, args, context, info) {
    return context.pubsub.asyncIterator("NEW_LINK")
}
function newVoteSubscribe(parent, args, context, info) {
    return context.pubsub.asyncIterator("NEW_VOTE")
}
const resolvers = {
    Query: {
        async user(root, { id }, context) {
            return context.models.User.findByPk(id)
        },
        async allRecipes(root, args, context) {
            return context.models.Recipe.findAll()
        },
        async recipe(root, { id }, context) {
            return context.Recipe.findByPk(id)
        },
        async feed(root, { filter, skip, limit, orderBy }, context) {
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

        },
        async getLink(root, { id }, context) {
            const userId = getUserId(context);
            return context.models.Link.findByPk(id);
        }

    },
    Mutation: {
        async createUser(root, { name, email, password }, context) {
            return context.models.User.create({
                name,
                email,
                password: await bcrypt.hash(password, 10)
            })
        },
        async createRecipe(root, { userId, title, ingredients, direction }, context) {
            console.log("model" + models);
            return context.models.Recipe.create({ userId, title, ingredients, direction })
        },
        async createLink(root, { url, description, postedBy }, context) {
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
        },

        async updateLink(root, { id, url, description }, context) {
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

        },
        async deleteLink(root, { id }, context) {
            return context.models.Link.destroy({ where: { id: id } }).then(() => {
                return true;
            })

        },
        async signup(root, { email, password, name }, context) {
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
        },
        async login(root, { email, password }, context) {
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
        },
        async vote(root, { linkId }, context) {
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
    },
    User: {
        async Links(root, { id }, context) {
            return context.models.User.findByPk(root.id, {
                include: [{ model: context.models.Link }]
            }).then(user => {
                return user.Links;
            })
        }
    },
    Recipe: {
        async user(recipe) {
            return recipe.getUser()
        }
    },
    Link: {
        async postedBy(root, { id }, context) {
            return context.models.User.findByPk(root.postedBy)
        },
        async votes(root, { id }, context) {
            return context.models.Vote.findAll({
                where: {
                    linkId: id
                }
            })
        }
    },
    Vote: {
        async link(root, { }, context) {
            return context.models.Vote.findByPk(root.id, { include: [{ model: context.models.Link, as: "links" }] })
                .then(voteDb => {
                    return voteDb.links;
                })
        },
        async user(root, { }, context) {
            return context.models.Vote.findByPk(root.id, { include: [{ model: context.models.User, as: "users" }] })
                .then(voteDb => {
                    return voteDb.users;
                })
        }
    },
    Subscription: {
        newLink: {
            subscribe: newLinkSubscribe,
            resolve: payload => {
                return payload
            },
        },
        newVote: {
            subscribe: newVoteSubscribe,
            resolve: payload => {
                return payload
            }

        }

    }
}
module.exports = resolvers;
async function link(root, { }, context) {
    return context.models.Vote.findByPk(root.id, { include: [{ model: context.models.Link, as: "links" }] })
        .then(voteDb => {
            return voteDb.links;
        })
}
async function user(root, { }, context) {
    return context.models.Vote.findByPk(root.id, { include: [{ model: context.models.User, as: "users" }] })
        .then(voteDb => {
            return voteDb.users;
        })
}
module.exports = {
    link,
    user
}
async function postedBy(root, { id }, context) {
    return context.models.User.findByPk(root.postedBy)
}
async function votes(root, { id }, context) {
    return context.models.Vote.findAll({
        where: {
            linkId: root.id
        }
    })
}

module.exports = {
    postedBy,
    votes,
  }
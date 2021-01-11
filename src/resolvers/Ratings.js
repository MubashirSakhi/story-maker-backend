async function ratedBy(root, { }, context) {
    return context.models.User.findByPk(root.ratedBy, {
        attributes: ['name']
    })
}
module.exports = {
    ratedBy,
}
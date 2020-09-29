async function author(root, { id }, context) {
    return context.models.User.findByPk(root.author, {
        attributes:['name','id']
    })
}
async function Stories(root, { id }, context) {
    return context.models.Story.findAll({
        where: {
            titleId: root.id
        }
    })
}

module.exports = {
    author,
    Stories,
  }
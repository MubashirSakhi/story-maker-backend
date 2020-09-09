async function Links(root, { id }, context) {
    return context.models.User.findByPk(root.id, {
        include: [{ model: context.models.Link }]
    }).then(user => {
        return user.Links;
    })
}
module.exports ={
    Links
}
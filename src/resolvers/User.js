async function Title(root, { id }, context) {
    return context.models.Titke.findAll({
        where:{
            author:id
        }
    })
}


module.exports = {
    Title
  }
async function contributor(root, { }, context) {
    return context.models.User.findByPk(root.contributor, {
        attributes: ['name']
    })
}
async function Ratings(root, { id }, context) {
    return context.models.Rating.findAll({
        where: {
            storyId: root.id
        }
    })
}
async function totalRating(root, { id }, context) {
    return context.models.Rating.findAll({
        where: {
            storyId:root.id
        },
        attributes: ['value', [context.models.sequelize.fn('AVG', context.models.sequelize.col('value')), 'valueCount']],

    })
        .then(ratingAvg => {
            if(ratingAvg[0].value !== null && ratingAvg[0].value !== undefined){
                console.log(parseFloat(ratingAvg[0].value));
                return ratingAvg[0].dataValues.valueCount;
            }
            else{
                console.log("null total")
               return null;
            }
            
        })
        .catch(e=> {
            throw e;
        })
}
module.exports = {
    contributor,
    Ratings,
    totalRating
}
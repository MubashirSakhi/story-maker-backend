const jwt = require('jsonwebtoken')
const APP_SECRET = "somesecretsarenottold";

function getUserId(context) {
  const Authorization = context.req.get('Authorization')
  try {
    if (Authorization) {
      const token = Authorization.replace('Bearer ', '')
      const { userId } = jwt.verify(token, APP_SECRET);
      return userId;
    }
    else {
      throw new Error('Not authenticated')
    }
  }

  catch (err) {
    if(err.name == "JsonWebTokenError"){
      throw new Error('Not Authenticated');
    }
    throw err;
  }

}

module.exports = {
  APP_SECRET,
  getUserId,
}
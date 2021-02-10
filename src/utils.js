const jwt = require('jsonwebtoken')
const dotenv = require('dotenv');
dotenv.config();

const APP_SECRET = process.env.APP_SECRET;
function getUserId(context) { // function is to check the token and verify it
  const Authorization = context.req.get('Authorization')
  try {
    if (Authorization) {
      const token = Authorization.replace('Bearer ', '')
      const { id } = jwt.verify(token, APP_SECRET);
      return id;
    }
    else {
      throw new Error('Not authenticated')
    }
  }

  catch (err) {
    if (err.name == "JsonWebTokenError") {
      throw new Error('Not Authenticated');
    }
    throw err;
  }

}

module.exports = {
  APP_SECRET,
  getUserId,
}
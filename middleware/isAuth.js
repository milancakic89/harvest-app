const jwt = require('jsonwebtoken');
const Supervizor = require('../model/Supervizor');

module.exports = (req, res, next) => {
  const token = req.get('Autorization');
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, `${process.env.APP_SECRET}`)
  } catch (error) {
    error.statusCode = 500;
    return res.json({
      message: "Token expired, please login again",
      success: false,
      statusCode: 500,
      admin: false,
      user: { username: null }
    })
  }

  if (!decodedToken) {
    const err = new Error('Not authenticated');
    err.statusCode = 401;
    throw err;
  }
  Supervizor.findOne({ supervizor: decodedToken.user })
    .then(user => {
      if (!user) {
        return res.json({
          message: "No user found, check token",
          success: false,
          user: decodedToken
        })
      }
      req.user = { user: decodedToken.user, username: decodedToken.user, admin: user.admin, body: req.body, createdBy: decodedToken.createdBy };
      next();
    }).catch(err => {
      throw err;
    })

}

const Supervizor = require('../model/Supervizor');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');


exports.getLogin = (req, res, next) => {
  return res.json({ message: "Login page", success: false })
}

exports.postLogin = (req, res, next) => {

  let user = req.body.email;
  let pass = req.body.password;
  let loadedUser;
  Supervizor.findOne({ username: user })
    .then(user => {
      if (!user) {
        return res.json({
          user: "",
          token: "",
          message: 'User not found',
          success: false,
          admin: false,
          createdBy: "",
          expiresIn: ""
        })
      }
      if (user) {
        loadedUser = user;
        return bcrypt.compare(pass, user.password)
      }
    })
    .then(isEqual => {
      if (!isEqual) {
        const error = new Error('Email or password did not match');
        error.statusCode = 401;
        throw error;
      }
      let current = new Date();
      let expires = String(current.getTime() + (12 * 60 * 60 * 1000));
      const token = jwt.sign({ user: loadedUser.supervizor, username: user, admin: loadedUser.admin, createdBy: loadedUser.createdBy }, `${process.env.APP_SECRET}`, { expiresIn: '16h' });
      return res.status(200).json({
        user: loadedUser.supervizor,
        token: token,
        message: 'Success',
        success: true,
        admin: loadedUser.admin,
        createdBy: loadedUser.createdBy,
        expiresIn: expires
      });
    })
    .catch(error => {
      let errors = new Error('Username or Password did not match');
      errors.statusCode = 401;
      errors.message = "Username or password did not match";
      res.json({ error: errors, message: 'Username or password did not match' })
    })
}


exports.postSignUp = (req, res, next) => {
  const username = req.body.email;
  const password = req.body.password;
  const name = req.body.name;

  Supervizor.findOne({ username: username })
    .then(user => {
      if (user) {
        return res.json({
          message: 'Email allready exists',
          success: false
        })
      }
      bcrypt.hash(password, 12)
        .then(hashedPassword => {
          const newUser = new Supervizor({
            supervizor: name,
            max_kutija: 100,
            username: username,
            createdBy: username,
            password: hashedPassword,
            admin: true
          });
          return newUser.save();
        })
        .then(result => {
          res.status(201).json({ message: "Success", user: username, success: true, createdBy: username });
        })
        .catch(error => {
          if (!error.statusCode) {
            error.statusCode = 500;
            throw error;
          }
          next(error)
        })
    })
    .catch(error => {
      throw new Error('Something went wrong')
    })
}

exports.postLogout = (req, res, next) => {
  req.session.isLogged = false;
  req.session.supervizor = 'Login';
  return res.json({ message: "You are now logged out" })
}
exports.getLogout = (req, res, next) => {
  return res.json({ message: "Logged out" });
}

exports.checkAdminStatus = (req, res, next) => {
  return res.json({
    admin: req.user.admin,
    user: req.user,
    success: true
  })
}
exports.resetPassword = (req, res, next) => {
  const email = req.body.email.trim();
  var token;
  var foundedUser;
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  crypto.randomBytes(30, (error, buffer) => {
    token = buffer.toString('hex');
    Supervizor.findOne({ username: email })
      .then(user => {
        if (!user) {
          return res.json({
            success: false,
            message: "User not found"
          })
        }
        user.resetToken = token;
        return user.save();
      })
      .then(done => {
        foundedUser = done;
        try {
          const msg = {
            to: req.body.email, // Change to your recipient
            from: 'harvesterapplication@gmail.com', // Change to your verified sender
            subject: 'Reset Password',
            html: `
          <h3 style="text-align: center; background-color: orange; color: black; padding: 5px; margin-bottom: 10px;">Password reset</h3>
         <div style="background-color: green;color: white; padding:15px;">
         <p>We received a password reset request for farming application. To reset password, click on a button below</p>
         <a href="https://farming-fc8ba.web.app/reset/${foundedUser.resetToken}" style="margin: 10px;background-color: blue;padding:10px; color: white; text-decoration: none;">Reset Password</a>
         </div>
         <div style=" padding:10px;">
         <h4>If this request is not made by you, please ignore this email</h4>
         </div>`,
          }
          sgMail
            .send(msg)
            .then(() => {
              return res.json({
                message: "Success",
                success: true
              })

            })
            .catch((error) => {
              return res.json({
                message: "Failed, try again",
                success: false
              })

            })
        }
        catch (e) {
          return res.json({
            message: "Failed, try again",
            success: false
          })
        }

      })
  })


}
exports.getResetPasswordUser = (req, res, next) => {
  const token = req.params.token;
  if (!token) {
    return res.json({
      message: "Failed..",
      success: false
    })
  }

  Supervizor.findOne({ resetToken: token })
    .then(user => {
      if (!user) {
        return res.json({
          message: "User with that token not found",
          success: false
        })
      }

      return res.json({
        message: "Success",
        success: true,
        user: user
      })
    }).catch(error => {
      return res.json({
        success: false,
        message: 'Something went wrong, try again'
      })
    })
}
exports.changePassword = (req, res, next) => {
  const id = req.body.id;
  const password = req.body.password;
  var foundedUser;
  if (!id && !password) {
    return res.json({
      message: 'Password not provided',
      success: false
    })
  }
  Supervizor.findOne({ _id: id })
    .then(user => {
      if (!user) {
        return res.json({
          message: 'User not found',
          success: false
        })
      }
      foundedUser = user;
      bcrypt.hash(password, 12)
        .then(hashedPassword => {
          user.password = hashedPassword,
            user.resetToken = '';
          return user.save();
        })
        .then(result => {
          res.status(201).json({ message: "Success", success: true });
        })
        .catch(error => {
          if (!error.statusCode) {
            error.statusCode = 500;
            throw error;
          }
          next(error)
        })
    })
    .catch(error => {
      throw new Error('Something went wrong')
    })
}
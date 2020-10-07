
const Supervizor = require('../model/Supervizor');
const Employees = require('../model/Employees');
const bcrypt = require('bcryptjs');
const Variety = require('../model/Variety');

exports.getAdd = (req, res, next) => {
  if (!req.user.admin) {
    return res.json({ message: "Login first" });
  }
  if (req.user.admin) {
    res.json({
      admin: req.user.admin == true ? true : false,
      supervizor: req.session.supervizor ? req.session.supervizor : 'Login'
    });
  } else {
    return res.json({ message: "Not autorized", success: false });
  }
  ;
};

exports.postSupervizor = (req, res, next) => {
  if (!req.user.admin) {
    return res.json({ message: "Login first", success: false });
  }
  if (req.user.admin) {
    var newUser = req.body.supervizor;
    var user = req.body.username;
    var password = req.body.password;

    let passCheck = true;

    if (newUser.length < 3 || newUser == '') {
      return res.json({ message: "Minimum 3 letters in name field", success: false });
    }
    if (password.length < 5 || password == '') {
      return res.json({ message: "Minimum 5 letters in password field", success: false });
    }
    if (user.length < 5 || user == '') {
      return res.json({ message: "Minimum 5 letters in username field", success: false });
    }
    for (let i = 0; i < newUser.length; i++) {
      if (isNaN(Number(newUser.charAt(i))) == false) {
        passCheck = false;
      }
    }

    if (passCheck == false) {
      return res.json({ message: "Number not alowed in name of supervizor", success: false });
    }

    if (newUser && user && password) {
      if (user) {
        bcrypt.hash(password, 12)
          .then(hashed => {
            Supervizor.find({ username: user })
              .then(superi => {
                if (Array.isArray(superi) && superi.length > 0) {
                  return res.json({ message: "Username Allredy exist for different account", success: false });
                } else {
                  let supervisor = new Supervizor({
                    supervizor: newUser,
                    username: user,
                    createdBy: req.user.username,
                    password: hashed,
                    admin: false
                  });
                  supervisor.save();
                  return res.json({ message: "Supervizor added", success: true });
                }
              })
              .catch(error => {
                return res.json({ message: "Error occured", success: false });
              })

          }).catch(error => {
            throw new Error('Something went wrong')
          })

      } else {
        return res.json({ message: "Error occured", success: false });
      }
    } else {
      return res.json({ message: "No privilege for operation", success: false });
    }
  }


}

exports.postBox = (req, res, next) => {
  if (!req.user.admin) {
    return res.json({ message: "Login first", success: false });
  }
  if (req.user.admin) {

  } else {
    return res.json({ message: "Not Autorized", success: false });
  }

}

exports.postEmployee = (req, res, next) => {
  if (!req.user.admin) {
    return res.json({ message: "Login first", success: false });
  }
  if (req.user.admin) {

    let name = req.body.name || '';
    let lastName = req.body.lastName || '';
    let phone = req.body.phone || '/';
    let passCheck = true;

    if (name.length < 3 || name == '') {
      return res.json({ message: 'Minimum 3 letters for name', success: false });
    }
    if (lastName.length < 3 || lastName == '') {
      return res.json({ message: 'Minimum 3 letters for lastname', success: false });
    }
    for (let i = 0; i < name.length; i++) {
      if (isNaN(Number(name.charAt(i))) == false) {
        passCheck = false;
      }
    }
    for (let i = 0; i < lastName.length; i++) {
      if (isNaN(Number(lastName.charAt(i))) == false) {
        passCheck = false;
      }
    }
    if (passCheck == false) {
      return res.json({ message: 'Number not allowed, check fields', success: false });
    }

    let date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let complete = `${day}/${month}/${year}`;

    let employee = new Employees({
      name: name,
      lastName: lastName,
      phone: phone,
      creationDate: complete,
      supervizor: req.user.username
    })
    employee.save();
    return res.json({ message: 'Success', success: true });

  }
}
exports.postVariety = (req, res, next) => {
  if (!req.user.admin) {
    return res.json({ message: "Login first", success: false });
  }
  if (req.user.admin) {
    let variety = req.body.variety;
    let newVariety = new Variety({
      variety: variety,
      supervizor: req.user.username
    });
    newVariety.save();

    return res.json({ message: "Success", success: true, variet: variety });
  } else {
    return res.json({ message: "Not autorized", success: false, variet: variety });
  }

}
const Boxes = require('../model/Boxes');
const Employees = require('../model/Employees');
const Base = require('../model/Base');
const Supervizor = require('../model/Supervizor');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Variety = require('../model/Variety');


exports.getAnalises = (req, res, next) => {
  if (!req.user.admin) {
    return res.json({ message: "Not autorized", success: false });
  }
  let sectors = [];
  let unique;
  Boxes.find({ supervizor: req.user.username, inUse: true })
    .then(allBoxes => {
      if (Array.isArray(allBoxes) && allBoxes.length > 0) {
        let total = 0;
        allBoxes.forEach(box => {
          sectors.push(box.sector)
        });
        unique = new Set(sectors);
        let allSectors = [...unique];
        let individualSectors = [];
        allSectors.forEach(sector => {
          individualSectors.push({ sector: sector, total: 0, boxes: 0 })
        });
        allBoxes.forEach(box => {
          individualSectors.forEach(individual => {
            if (box.sector == individual.sector) {
              individual.total += box.amount;
              individual.boxes += 1;
              total += box.amount;
            }
          })
        })
        return res.json({
          sectors: individualSectors,
          total: total
        })
      } else {
        return res.json({
          sectors: { sector: [], total: 0 }
        })
      }
    })
    .catch(error => {
      throw error;
    })
}

exports.getHelp = (req, res, next) => {
  if (!req.user.admin) {
    return res.json({ message: "Not autorized", success: false });

  }
  //data for help
}

exports.postCloseNewDay = (req, res, next) => {
  if (!req.user.admin) {
    return res.json({ message: "Not autorized", success: false });
  }
  let date = new Date();
  let day = date.getDate();
  let month = date.getMonth();
  let current = Number(date.getFullYear());
  let complete = `${day}/${month}/${current}`;
  let confirmation = req.body.confirmation.toUpperCase();

  if (confirmation !== 'YES') {
    return res.json({ message: "Confirmation letters not provided", success: false })
  }
  var data = [];
  let names = req.body.name;
  let amount = req.body.amount;
  let boxSingle = req.body.boxSingle;
  let box = req.body.box;
  let closedDay;
  let total = Number(req.body.total);

  if (!names) {
    res.send({ message: "No data for saving", success: true })
  }
  else {
    if (Array.isArray(names) && names.length > 0) {
      Base.find({ date: complete })
        .then(response => {
          if (Array.isArray(response) && response.length > 0) {
            return res.json({ message: "Day allready closed for this date", success: false })
          }
          else {
            for (let i = 0; i < names.length; i++) {
              data.push({
                name: names[i],
                amount: amount[i],
                box: boxSingle[i]
              })

            }
            closedDay = new Base({
              date: complete,
              report: {
                total: total,
                box: box,
                data: data
              }
            })
          }
          closedDay.save();
          return removeBoxes()
        })
        .catch(error => {
          return res.json({ message: "Something went wrong", success: false })
        })

    } else {
      Base.find({ date: complete })
        .then(response => {
          if (Array.isArray(response) && response.length > 0) {
            return res.json({ message: "Day allready closed for this date", success: true })
          }
          else {
            data.push({
              name: names,
              amount: amount,
              box: boxSingle
            });
            closedDay = new Base({
              date: complete,
              report: {
                total: total,
                box: box,
                data: data
              }
            })
            closedDay.save();
            return removeBoxes()
          }
        })
        .catch(error => {
          return res.json({ message: error })
        })

    }
  }
  function removeBoxes() {
    Boxes.deleteMany({ inUse: true })
      .then(over => {
        return res.json({ message: "Day succcesfully closed", dayClosed: true, success: false })
      })
      .catch(error => {
        return res.json({ message: "Something went wrong", dayClosed: false, success: false })

      })
  }
}
exports.postTransferBoxes = (req, res, next) => {
  if (!req.user.admin) {
    return res.json({ message: "Not autorized", success: false });
  }
  let onWhoID = req.body.onWho;
  let fromWhoID = req.body.fromWho;
  let fromEmployee;
  let onEmployee;
  Employees.findOne({ _id: fromWhoID })
    .then(fromEmployeeData => {
      if (!fromEmployeeData) {
        return res.json({
          success: false,
          message: 'User to transfer from not found!!'
        })
      }
      fromEmployee = fromEmployeeData;
      Employees.findOne({ _id: onWhoID })
        .then(onEmployeeData => {
          if (!onEmployeeData) {
            return res.json({
              success: false,
              message: 'User to transfer to not found!!'
            })
          }
          onEmployee = onEmployeeData;
          Boxes.updateMany({ employee: fromEmployee.name, supervizor: req.user.username }, { "$set": { employee: onEmployee.name } })
            .then(transfered => {
              Employees.findOneAndDelete({ _id: fromWhoID, supervizor: req.user.username })
                .then(deleted => {
                  res.json({ message: "Succes", deleted: deleted, success: true })
                })
                .catch(error => {
                  res.json({ message: "Boxes transfered only", success: "half" })
                })
            })
            .catch(error => {
              res.json({ message: "Something went wrong", success: false })
            })

        }).catch(error => {
          let err = new Error();
          err.statusCode = 404;
          throw err;
        })
    }).catch(error => {
      let err = new Error();
      err.statusCode = 404;
      throw err;
    })
}

exports.postDeleteBoxes = (req, res, next) => {
  if (!req.user.admin) {
    return res.json({ message: "Not autorized", success: false });

  }
  let name = req.body.name;
  let lastime = req.body.lastime;
  Boxes.deleteMany({ employee: name, supervizor: req.user.username })
    .then(remove => {
      Employees.findOneAndDelete({ name: name, lastime: lastime, supervizor: req.user.username })
        .then(removed => {
          res.json({ succes: true, message: "Box transfered, employee removed" })

        })
        .catch(error => {
          res.json({ succes: false, message: "Only boxes erased" })

        })
    })
    .catch(error => {
      res.json({ message: "Something went wrong", success: false })
    })

}

exports.postDeleteEmployee = (req, res, next) => {
  if (!req.user.admin) {
    return res.json({ message: "Not autorized", success: false });

  }
  let id = req.body.id;
  Employees.findOneAndDelete({ _id: id, supervizor: req.user.username })
    .then(done => {
      res.json({ message: "Employee removed", employee: done })

    })
    .catch(error => {
      res.json({ message: "Something went wrong" })
    })
}

exports.getDeleteEmployee = (req, res, next) => {
  if (!req.user.admin) {
    return res.json({ message: "Not autorized", success: false });

  }
  var id = req.body.id;
  var filteredEmployees;
  var pickedEmployee;
  Employees.find({ supervizor: req.user.username })
    .then(employees => {
      if (!employees) {
        const error = new Error();
        error.statusCode = 401;
        throw error;
      }
      let allEmployees = [...employees];
      filteredEmployees = allEmployees.filter(employee => {
        if (employee._id.toString() != id) {
          return true;
        } else {
          pickedEmployee = employee;
          return false;
        }
      })
      return filteredEmployees;
    })
    .then(filtered => {

      Boxes.find({ employee: pickedEmployee.name, supervizor: req.user.username })
        .then(boxes => {
          if (Array.isArray(boxes) && boxes.length > 0) {

            return res.json({
              boxes: boxes.length,
              picked: pickedEmployee,
              employees: filtered,
              admin: req.user.admin,
              supervizor: req.user.username,
              success: true
            })
          } else {
            return res.json({
              boxes: 0,
              employees: '',
              picked: pickedEmployee,
              admin: req.user.admin,
              supervizor: req.user.username,
              success: false
            })
          }
        })
    })


}

exports.postNotification = (req, res, next) => {
  if (!req.user.admin) {
    return res.json({ message: "Not autorized", success: false });

  }
  let maximum = Number(req.body.maximum);
  if (typeof maximum == 'number') {

  }
  Supervizor.find({ admin: true, supervizor: req.user.username })
    .then(supervizor => {

      supervizor[0].maxBoxes = maximum;
      return supervizor[0].save();
    })
    .then(over => {
      req.flash('success', `Uspesno. Obavestavaju se kutije preko ${maximum}(kg)`)
      return res.json({
        maximum: maximum || 0,
        admin: req.user.admin,
      })
    })
}

exports.getNotification = (req, res, next) => {
  if (!req.user.admin) {
    return res.json({ message: "Not autorized", success: false });

  }
  Supervizor.find({ admin: true, supervizor: req.user.username })
    .then(supervizor => {
      return res.json({
        maximum: supervizor[0].maxBoxes || 0,
        admin: req.user.admin == true ? true : false,
        supervizor: req.user.username ? req.user.username : 'Login'
      })
    })

}

exports.getFarming = (req, res, next) => {
  if (!req.user.admin) {
    return res.json({ message: "Not authorized for this action" })
  }
  if (req.user.admin) {
    let date = new Date();
    let today = Number(date.getDate())
    let boxes = null;
    let employees = null;
    let variety = null;
    let currentYear = `${date.getFullYear()}`;

    let shorterDate = currentYear.slice(2, currentYear.length)
    let month = date.getMonth() + 1;
    if (month < 10) {
      month = `0${month}`;
    }
    var boxFixedPrefix = `${month}${shorterDate}`;

    //get employeee
    Employees.find({ supervizor: req.user.username })
      .then(allEmployees => {
        if (Array.isArray(allEmployees) && allEmployees.length > 0) {
          employees = allEmployees;
          employees.sort()
          getVariety();
        } else {
          employees = null;
          getVariety();
        }
      })
    function getVariety() {
      Variety.find({ supervizor: req.user.username })
        .then(varietyData => {
          if (!varietyData) {
            variety = null;
            getBoxes();
          } else {
            variety = varietyData;
            getBoxes();
          }
        }).catch(error => {
          throw error;
        })
    }
    function getBoxes() {
      Boxes.find({ supervizor: req.user.username })
        .then(boxesArray => {
          if (Array.isArray(boxesArray) && boxesArray.length > 0) {
            boxes = boxesArray;
            boxes.sort()
            return res.json({
              boxes: boxes,
              boxFixedPrefix: boxFixedPrefix,
              today: today,
              variety: variety,
              employees, employees,
              admin: req.user.admin,
              supervizor: req.user.username
            })
          } else {
            boxes = null;
            return res.json({
              boxes: boxes,
              boxFixedPrefix: boxFixedPrefix,
              today: today,
              variety: variety,
              employees, employees,
              admin: req.user.admin,
              supervizor: req.user.username
            })
              ;
          }
        });
    }
  } else {
    return res.json({ message: "Not autorized", success: false });
  }

};


exports.getBase = (req, res, next) => {
  if (!req.user.admin) {
    return res.json({ message: "Login first", success: false });

  }


  if (req.user.admin) {
    Boxes.find({ supervizor: req.user.username, printed: true })
      .then(boxes => {
        boxes.sort()
        return res.json({
          boxes: boxes,
          admin: req.user.admin,
          supervizor: req.user.username,
        })

      })
      .catch(error => {
        res.json({ message: "Error occured", success: false })
      })

  } else {
    return res.json({ message: "Not autorized", success: false });
  }

};


exports.getEmployees = (req, res, next) => {
  if (!req.user.admin) {
    return res.json({ message: "Login first" });
  }
  if (req.user.admin) {
    Employees.find({ supervizor: req.user.username })
      .then(employees => {
        if (Array.isArray(employees) && employees.length > 0) {
          employees.sort()
          res.json({
            employees: employees,
            admin: req.user.admin,
            supervizor: req.user.username
          })
            ;
        } else {
          res.json({
            employees: employees,
            admin: req.user.admin,
            supervizor: req.user.username
          });
        }
      })
  } else {
    res.json({ message: "Not Autorized" });
  }
};

exports.postRecord = (req, res, next) => {
  if (!req.user.admin) {
    return res.json({ message: "Login first" });
  }

  if (req.user.admin) {
    var boxLetters = req.body.boxNamePrefix.toUpperCase();
    let confirm = true;
    if (boxLetters.length < 3) {
      res.json({ message: "Box must contain 3 letters" });

    }
    for (let i = 0; i < boxLetters.length; i++) {
      let c = Number(boxLetters.charAt(i));
      if (!isNaN(c)) {
        confirm = false;
      }
    }
    for (let i = 0; i < boxLetters.length; i++) {

      if (boxLetters.charAt(0) == ' ') {
        confirm = false;
      }
    }
    if (!req.body.employee && !req.body.variety) {
      confirm = false;
    }

    if (confirm) {
      var boxPrefix = req.body.boxPrefix;
      var boxNumber = req.body.boxNumber;
      var boxFixedPrefix = req.body.boxFixedPrefix;
      var sector = req.body.sector || 1;
      var variety = req.body.variety || 'default';
      var line = req.body.line || 1;
      var employee = req.body.employee;

      let date = new Date();
      let day = date.getDate();
      if (boxPrefix < 10) {
        boxPrefix = `0${boxPrefix}`;
      }

      let month = date.getMonth() + 1;
      let year = date.getFullYear();
      let complete = `${day}/${month}/${year}`;
      let allBoxes;
      var current = 1;
      var howMany = Number(boxNumber);
      Boxes.find({ prefix: boxLetters, supervizor: req.user.username })
        .then(boxes => {
          allBoxes = boxes;
          if (Array.isArray(boxes) && boxes.length > 0) {
            current = Number(boxes[0].proccedWithBox);
            howMany = Number(boxNumber) + Number(current);
            current++;
            return record()
          } else {
            current = 1;
            record()
          }

        })

      // record()
      function record() {
        save();
        function save() {

          if (current <= howMany) {
            var today = new Date();
            var time = today.getHours() + ":" + today.getMinutes();
            let boxBase;
            if (current < 10) {
              boxBase = `${boxPrefix}${boxFixedPrefix}${boxLetters}0${current}`;
            } else {
              boxBase = `${boxPrefix}${boxFixedPrefix}${boxLetters}${current}`;
            }
            let box = new Boxes({
              box: boxBase,
              employee: employee,
              sector: sector,
              date: complete,
              proccedWithBox: Number(boxNumber),
              prefix: boxLetters,
              amount: 0,
              printed: false,
              time: time,
              line: line,
              variety: variety,
              inUse: false,
              supervizor: req.user.username,
              measurement: req.user.username,
              oldInputs: false
            })
            box.save();
            current++;
            save();
          } else {
            Boxes.updateMany({ prefix: boxLetters, supervizor: req.user.username }, { "$set": { proccedWithBox: howMany } })
              .then(response => {
                return res.json({ success: true, boxes: allBoxes })
              })
          }
        }
      }
    } else {
      res.json({ message: "Box must contain 3 letters" })
    }
  }

}
exports.getPrint = (req, res, next) => {
  if (!req.user.admin) {
    return res.json({ message: "Login first" })
  }
  if (req.user.admin) {

  } else {
    res.json({ message: "Not Autorized" })
  }
  Boxes.find({ printed: false, supervizor: req.user.username })
    .then((boxes) => boxes.sort())
    .then(sorted => {
      res.json({
        boxes: sorted,
        admin: req.user.admin,
        supervizor: req.user.username,
      })
    })

}

exports.getReport = (req, res, next) => {
  if (!req.user.admin) {
    return res.json({ message: "Login first" })
  }
  if (req.user.admin) {
    let years = [];
    let date = new Date();
    let day = date.getDate();
    let month = date.getMonth();
    let current = Number(date.getFullYear());
    let today = `${day}/${month + 1}/${current}`;
    let previousYear = current - 1;
    let twoYearsAgo = current - 2;
    years.push(current, previousYear, twoYearsAgo);


    Boxes.find({ printed: true, supervizor: req.user.username })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          let calculated = [];
          let names = [];
          data.forEach(name => {
            names.push(name.employee);
          })
          let uniqueNames = [... new Set(names)];
          uniqueNames.forEach(name => {
            calculated.push({
              name: name,
              amount: 0,
              box: 0
            })
          })
          for (let i = 0; i < data.length; i++) {
            for (let j = 0; j < calculated.length; j++) {
              if (data[i].employee == calculated[j].name) {
                calculated[j].amount += data[i].amount;
                if (data[i].amount > 0) {
                  calculated[j].box++;
                }
              }
            }
          }
          let total = 0;
          let box = 0;
          calculated.forEach(box => {
            total += box.amount;
            if (box.amount > 0) {
              box += box.box;
            }
          })
          return res.json({
            years: years,
            date: today,
            employees: calculated,
            total: total,
            boxes: box,
            admin: req.user.admin,
            supervizor: req.user.username,
          })
        } else {
          res.json({
            years: years,
            date: today,
            employees: [],
            total: 0,
            boxes: 0,
            admin: req.user.admin,
            supervizor: req.user.username,
          })
        }
      })
  } else {
    res.json({ message: "Not authorised" });
  }

};
exports.postReport = (req, res, next) => {

  if (!req.user.admin) {
    return res.json({ message: "Login first" })
  }
  if (req.user.admin) {

  } else {
    return res.json({ message: "Not Autorized" })
  }
  // res.redirect('/measurement');
  let day = req.body.day;
  let month = +req.body.month;
  let year = req.body.year;
  let complete = `${day}/${month}/${year}`;

  let years = [];
  let date = new Date();
  let current = Number(date.getFullYear());
  let previousYear = current - 1;
  let twoYearsAgo = current - 2;
  let currentMonth = Number(month) + 1;
  let today = `${day}/${currentMonth}/${current}`;

  years.push(current, previousYear, twoYearsAgo);

  Base.find({ date: complete, supervizor: req.user.username })
    .then(response => {
      if (Array.isArray(response) && response.length > 0) {
        return res.json({
          years: years,
          date: today,
          employees: response[0].report.data,
          total: response[0].report.total,
          box: response[0].report.box,
          admin: req.user.admin == true ? true : false,
          supervizor: req.user.username ? req.user.username : 'Login'
        })
      } else {
        res.json({
          years: years,
          data: 0,
          date: today,
          total: 0,
          box: 0,
          admin: req.user.admin == true ? true : false,
          supervizor: req.user.username ? req.user.username : 'Login'
        });
      }
    })
}

exports.postPrinted = (req, res, next) => {
  if (!req.user.admin) {
    res.json({ message: "Login first" })
  }
  if (req.user.admin) {
    Boxes.updateMany({ printed: false, supervizor: req.user.username }, { "$set": { printed: true } })
      .then(response => {
        if (Array.isArray(response) && response.length > 0) {
          res.json({ message: "Boxes recorded", success: true })
        } else {
          res.json({ message: "All boxes are printed", success: true })
        }

      })
      .catch(error => {
        res.json({ message: "Error occured", error: error })

      })
  } else {
    return res.json({ message: "Not autorized" });
  }
}

exports.getDocs = (req, res, next) => {
  return res.render('docs', {
  })
}
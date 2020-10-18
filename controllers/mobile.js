const Employees = require('../model/Employees');
const Boxes = require('../model/Boxes');

exports.postBarcode = (req, res, next) => {
  if (!req.session.isLogged) {
    return res.json({ message: "Login first", success: true });
  }
  let amount = Number(req.body.amount)
  var box = req.body.box;
  var employee = req.body.employee;
  let sector = Number(req.body.sector)
  let line = Number(req.body.line)

  if (isNaN(amount) == true || isNaN(sector) == true || isNaN(line) == true) {
    return res.json({ message: "error occured", success: false });
  }

  if (box) {
    Boxes.findOne({ box: box })
      .then(box => {
        if (box) {
          if (amount > req.session.maximum) {
            return res.json({
              success: false,
              message: `Barcode maximum is ${req.session.maximum}(kg), and requested is ${amount} (kg)`
            });
          }
          let date = new Date();
          let day = date.getDate();
          let month = date.getMonth()
          let year = date.getFullYear();
          let complete = `${day}/${month}/${year}`;
          let today = new Date();
          let minutes = today.getMinutes() < 10 ? '0' + today.getMinutes() : today.getMinutes();
          let time = today.getHours() + ":" + minutes;
          if (amount > 0) {
            box.inUse = true;
          } else {
            box.inUse = false;
          }
          box.sector = sector;
          box.line = line;
          box.date = complete;
          box.employee = employee;
          box.amount = amount;
          box.time = time;
          box.measurement = req.session.supervizor
          box.save();
          return res.json({ message: 'Success', success: true })
        } else {
          res.json({ messgae: 'Box must contain sector', success: false });
        }
      })
      .catch(error => {
        return res.json({ message: 'error occured', success: false })
      })
  }
}

exports.getBoxBarcode = (req, res, next) => {

  let box = req.params.box.toUpperCase();
  if (box) {
    Employees.find({ supervizor: req.user.createdBy })
      .then(response => {
        if (Array.isArray(response) && response.length > 0) {
          return employees = response;
        } else {
          return;
        }
      })
      .then(Employees => {
        Boxes.findOne({ box: box, supervizor: req.user.createdBy })
          .then(responce => {
            if (responce) {
              return res.json({
                employees: Employees,
                box: responce,
                success: true,
                message: 'Success'
              });

            } else {
              res.json({ message: 'Barcode not found', success: false });
            }
          })
          .catch(err => {
            throw err;
          })
      })

  } else {
    res.json({
      success: false,
      message: "Barcode not found"
    })
  }
}

exports.getBarcode = (req, res, next) => {

  res.json({
    boxes: '',
    employee: '',
    success: true
  })
}

exports.postUpload = (req, res, next) => {
  if (!req.session.isLogged) {
    return res.json({ message: 'Login first', success: false })
  }
  let notify = false;
  let data = [];
  for (let i = 0; i < req.body.box.length; i++) {
    data.push({
      box: req.body.box[i],
      amount: req.body.amount[i] || 0
    })
  }

  Boxes.find({ employee: req.body.name })
    .then(boxes => {
      if (Array.isArray(boxes) && boxes.length > 0) {
        boxes.forEach(box => {
          updateSingle(box)
        })
        function updateSingle(singleBox) {
          data.forEach(response => {
            if (esponse.box === singleBox.box) {
              singleBox.amount = esponse.amount
              if (esponse.amount > 0) {
                singleBox.inUse = true;
              }
              if (esponse.amount > req.session.maximum) {
                notify = true;
                return;
              }
              return singleBox.save();
            }
          })
        }
        if (notify !== true) {
          return res.json({ message: 'success', success: true })
        } else {
          return res.json({ message: `Some boxes are over ${req.session.maximum} (kg), NOT SAVED`, success: false });
        }
      }
    })
    .catch(error => {
      return res.json({ message: 'Error occured', success: false })
    })
}

exports.postEmployee = (req, res, next) => {
  let id = req.body.id;
  var employees;
  if (id == 'all') {
    Employees.find({ supervizor: req.user.createdBy })
      .then(response => {
        if (Array.isArray(response) && response.length > 0) {
          return employees = response;
        }
      })
      .then(response => {
        Boxes.find()
          .then(boxes => {
            if (Array.isArray(boxes) && boxes.length > 0) {
              boxes.sort();
              return res.json({
                boxes: boxes,
                employees: employees,
                success: true,
                message: 'Success'
              })
            } else {
              res.json({
                boxes: boxes,
                employees: employees,
                success: false,
                message: 'Success'
              })
            }
          })
          .catch(error => {
            return res.json({
              boxes: [],
              employees: [],
              success: false,
              message: 'Error, try again'
            })
          })
      }).catch(error => {
        return res.json({
          boxes: [],
          employees: [],
          success: false,
          message: 'Error, try again'
        })
      })
  } else {
    if (id != '') {
      Employees.find({ supervizor: req.user.createdBy })
        .then(response => {
          if (Array.isArray(response) && response.length > 0) {
            return employees = response;
          }
        })
        .then(allEmployees => {
          const selected = allEmployees.filter(employee => {
            return employee._id == id;
          })
          Boxes.find({ employee: selected[0].name })
            .then(boxes => {
              if (Array.isArray(boxes) && boxes.length > 0) {
                boxes.sort();
                return res.json({
                  boxes: boxes,
                  employees: employees,
                  success: true,
                  message: 'Success'
                })
              } else {
                res.json({
                  boxes: boxes,
                  employees: employees,
                  success: false,
                  message: 'Success'
                })
              }
            })
            .catch(error => {
              return res.json({ message: 'Error occured', success: false })
            })
        })
        .catch(error => {
          return res.json({ message: error, success: false })
        })
    } else {
      return res.json({
        boxes: [],
        employees: [],
        success: false,
        message: 'Error, try again'
      })
    }
  }
}

exports.getIMobileReport = (req, res, next) => {
  Boxes.find({ printed: true, supervizor: req.user.createdBy })
    .then(printedBoxes => {
      if (Array.isArray(printedBoxes) && printedBoxes.length > 0) {
        let reportData = [];
        let names = [];
        printedBoxes.forEach(name => {
          names.push(name.employee);
        })
        let uniqueNames = [... new Set(names)];
        uniqueNames.forEach(name => {
          reportData.push({
            name: name,
            amount: 0,
            boxes: 0
          })
        })

        for (let i = 0; i < printedBoxes.length; i++) {
          for (let j = 0; j < reportData.length; j++) {
            if (printedBoxes[i].employee == reportData[j].name) {
              reportData[j].amount += printedBoxes[i].amount;
              if (printedBoxes[i].amount > 0) {
                reportData[j].boxes++;
              }

            }
          }
        }
        let total = 0;
        let boxes = 0;
        reportData.forEach(box => {
          total += box.amount;
          if (box.amount > 0) {
            boxes += box.boxes;
          }

        })

        return res.json({
          data: reportData,
          total: total,
          boxes: boxes,
          success: true
        })
      } else {
        return res.json({
          data: 0,
          total: 0,
          boxes: 0,
          success: false
        });
      }
    })
}

exports.postFilter = (req, res, next) => {
  let prefix = req.user.body.prefix.toUpperCase();
  let employees = [];
  Employees.find({ supervizor: req.user.createdBy })
    .then(Employees => {
      if (Array.isArray(Employees) && Employees.length > 0) {
        return employees = Employees;
      } else {
        return;
      }

    })
    .then(done => {
      if (prefix != '') {
        Boxes.find({ printed: true, supervizor: req.user.createdBy })
          .then(boxes => {
            if (Array.isArray(boxes) && boxes.length > 0) {
              let filtered = boxes.filter(box => {
                if (box.box.includes(prefix)) {
                  return true;
                }
                return false;
              })
              return res.json({
                employees: employees,
                prefix: prefix,
                boxes: filtered,
                admin: req.session.admin == true ? true : false,
                supervizor: req.session.supervizor ? req.session.supervizor : 'Login',
                success: true
              })
                ;
            } else {
              return res.json({
                prefix: '',
                employees: employees,
                boxes: boxes,
                admin: req.session.admin == true ? true : false,
                supervizor: req.session.supervizor ? req.session.supervizor : 'Login',
                success: true
              });
            }
          })
      } else {
        Boxes.find({ printed: true })
          .then(boxes => {
            if (Array.isArray(boxes) && boxes.length > 0) {
              req.session.prefix = '';
              return res.json({
                prefix: prefix,
                employees: employees,
                error: req.flash('error'),
                boxes: boxes,
                admin: req.session.admin == true ? true : false,
                supervizor: req.session.supervizor ? req.session.supervizor : 'Login',
                success: true
              })
                ;
            } else {
              return res.json({
                prefix: '',
                employees: employees,
                error: req.flash('error'),
                boxes: boxes,
                admin: req.session.admin == true ? true : false,
                supervizor: req.session.supervizor ? req.session.supervizor : 'Login',
                success: true
              })
            }
          })
      }
    })


}
exports.postUpdateMeasurement = (req, res, next) => {

  var value = req.body.newValue;
  let box = req.body.boxId;

  let today = new Date();
  let minutes = today.getMinutes() < 10 ? '0' + today.getMinutes() : today.getMinutes();
  let time = today.getHours() + ":" + minutes;



  Boxes.findOne({ box: box })
    .then(box => {
      if (Array.isArray(box) && box.length > 0) {

        let date = new Date();
        let day = date.getDate();
        let month = date.getMonth()
        let year = date.getFullYear();
        let complete = `${day}/${month}/${year}`;

        box.amount = value;
        box.date = complete;
        box.time = time;
        box.stari_unosi = true;
        box.measurement = req.session.supervizor
        if (value > 0) {
          box.inUse = true;
        }
        if (box.amount > req.session.maximum) {
          req.flash('warning', `Sacuvano. Kutija ima preko `)
          res.json({ message: `Succes with warning on box weight over ${req.session.maximum} (kg)!!!`, success: true })
        }
        else { res.json({ message: "Success", success: true }) }
        box.save()
      }
    })
    .catch(error => {
      res.error({ message: 'Error occured', success: false })
    })

}

exports.postMeasurement = (req, res, next) => {
  let amount = Number(req.user.body.amount) //? Number(req.body.amount) : 0;
  var id = req.user.body.id;
  var employee = req.user.body.employee;
  let sector = Number(req.user.body.sector)// || req.body.sectorStari;
  let line = Number(req.user.body.line)// || req.body.redStari;
  console.log(amount, id, employee, sector, line, req.user.createdBy)

  if (isNaN(amount) == true || isNaN(sector) == true || isNaN(line) == true) {
    res.json({ message: 'field must contain numbers', success: false })
  }

  if (id) {

    Boxes.findOne({ _id: id, supervizor: req.user.createdBy })
      .then(box => {

        if (box) {
          let date = new Date();
          let day = date.getDate();
          let month = date.getMonth()
          let year = date.getFullYear();
          let complete = `${day}/${month}/${year}`;
          let today = new Date();
          let minutes = today.getMinutes() < 10 ? '0' + today.getMinutes() : today.getMinutes();
          let time = today.getHours() + ":" + minutes;
          if (amount > 0) {
            box.inUse = true;
          } else {
            box.inUse = false;
          }
          box.sector = sector;
          box.line = line;
          box.date = complete;
          box.employee = employee;
          box.amount = amount;
          box.time = time;
          // box.measurement = req.session.supervizor
          //
          return box.save();

        } else {
          res.json({ message: 'error, box must have sector', success: false })
        }
      })
      .then(done => {
        return res.json({ message: 'Success', success: true })
      })
      .catch(error => {
        res.json({ message: 'Error', success: true, error: error })
      })

  }
}

exports.getMeasurement = (req, res, next) => {
  let employees = [];
  Employees.find({ supervizor: req.user.createdBy })
    .then(allEmployees => {
      if (Array.isArray(allEmployees) && allEmployees.length > 0) {
        allEmployees.sort()
        return employees = allEmployees;
      } else {
        return;
      }

    })
    .then(done => {
      Boxes.find({ printed: true, supervizor: req.user.createdBy })
        .then(boxes => {
          if (Array.isArray(boxes) && boxes.length > 0) {
            boxes.sort()
            return res.json({
              employees: employees,
              boxes: boxes,
              success: true
            });
            ;
          } else {
            boxes.sort()
            return res.json({
              employees: employees,
              boxes: boxes,
              success: true,
            });
          }
        })
    })
}

exports.getIdBoxes = (req, res, next) => {

  let box = '' + req.params.id;
  let employees;
  if (box) {
    Employees.find()
      .then(response => {
        if (Array.isArray(response) && response.length > 0) {
          return employees = response;
        } else {
          return;
        }
      })
      .then(Employees => {
        Boxes.findOne({ box: box })
          .then(responce => {

            if (responce) {
              return res.json({
                employees: Employees,
                boxes: responce,
                success: true,
                admin: req.session.admin == true ? true : false,
                supervizor: req.session.supervizor ? req.session.supervizor : 'Login'
              });
              ;
            } else {
              return res.json({
                boxes: '',
                employees: '',
                admin: req.session.admin == true ? true : false,
                supervizor: req.session.supervizor ? req.session.supervizor : 'Login',
                success: true
              });
            }
          });
      })


  } else {
    res.json({ message: 'Box not picked', success: false })
  }

}


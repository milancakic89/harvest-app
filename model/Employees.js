const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const employeeSchema = new Schema({
   name:{
     type: String,
     required: true
   },
   lastName:{
    type: String,
    required: true
  },
  phone:{
    type: String,
    required: true
  },
  creationDate:{
    type: String,
    required: true
  },
  supervizor:{
    type: String,
    required: true
  }

})

module.exports = mongoose.model('Employee', employeeSchema);
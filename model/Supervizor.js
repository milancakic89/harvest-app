const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const supervizor = new Schema({
  supervizor: {
    type: String,
    required: true
  },
  max_kutija: Number,
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  resetToken: String,
  createdBy: String,
  admin:{
    type: Boolean,
    required: true
  }
})

module.exports = mongoose.model('Supervizor', supervizor);
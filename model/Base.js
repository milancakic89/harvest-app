const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const baseSchema = new Schema({
  datum: String,
  supervizor: String,
  report: {
    total: Number,
    boxes: Number,
    data: []
  }
})

module.exports = mongoose.model('Base', baseSchema);
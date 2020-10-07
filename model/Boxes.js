const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const boxesSchema = new Schema({
  box: {
    type: String,
    required: true
  },
  prefix: String,
  amount: Number,
  employee: String,
  proccedWithBox: Number,
  sector: String,
  date: String,
  time: String,
  line: Number,
  inUse: Boolean,
  variety: String,
  printed: Boolean,
  measurement: String,
  supervizor: String,
  oldInputs: Boolean
})

module.exports = mongoose.model('Boxes', boxesSchema);
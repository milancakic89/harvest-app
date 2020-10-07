const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const varietySchema = new Schema({
   variety:{
     type: String,
     required: true
   },
    supervizor: String,

})
module.exports = mongoose.model('Variety', varietySchema);
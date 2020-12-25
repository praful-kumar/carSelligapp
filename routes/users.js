const mongoose = require("mongoose");
const plm = require('passport-local-mongoose');

mongoose.connect('mongodb://localhost/carsellapp');

const userSchema = mongoose.Schema({
  name: String,
  username: String,
  email:String,
  passsword:String,
  Cars:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'car'
  }],
  profileImg:{
    type: String,
    default: '../images/uploads/def.jpg'
  }
})
userSchema.plugin(plm);
module.exports = mongoose.model('user', userSchema);

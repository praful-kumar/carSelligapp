const mongoose = require("mongoose");


const carSchema = mongoose.Schema({
    sellerid:{
        type:mongoose.Schema.Types.ObjectId
    },
    carname: String,
    carprice: String,
    contact:String,
    carimg: {
        type: String,
        default: '../images/uploads/def.jpg'
      }
})

module.exports = mongoose.model('car', carSchema);

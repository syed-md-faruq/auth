const mongoose = require("mongoose");
const schema = mongoose.Schema;

const tokenschema = new schema({
    userid: {
        type: schema.Types.ObjectId,
        required: true,
        ref: "user",
    },
    token: {
        type: String,
        required: true,
    },
    createdat: {
        type: Date,
        default: Date.now,
        expires: 3600,
    },
});

 const token = mongoose.model("token", tokenschema);
 module.exports = token

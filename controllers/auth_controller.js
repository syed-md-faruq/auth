const createerror = require('http-errors');
const user_model = require('../models/user_model');
const token_model = require('../models/token_model');
const {authschema} = require('../helpers/schema_validation');
const {accesstoken, refreshtoken, verifyrefreshtoken} = require('../helpers/jwt');
const sendemail = require("../helpers/sendemail");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

exports.signup = async(req, res, next)=>{
    try {
        const result = await authschema.validateAsync({"email":req.body.email,"password":req.body.password});

        const doesexist = await user_model.findOne({email: result.email});
        if(doesexist) throw createerror.Conflict(`${result.email} already exists`);

        const user = new user_model(req.body);
        const saveduser = await user.save();
        const acctoken = await accesstoken(saveduser.id);
        const reftoken = await refreshtoken(saveduser.id);
        res.send({acctoken,reftoken});

    } catch (error) {
        if(error.isJoi === true) error.status = 422
        next(error);
    }
};
exports.login = async(req, res, next)=>{
    try {
        const result = await authschema.validateAsync(req.body);
        const user = await user_model.findOne({email: result.email});

        if(!user) throw createerror.NotFound("User not registered");

        const ismatch = await user.isvalidpassword(result.password)
        if(!ismatch) throw createerror.Unauthorized("Invalid Username/Password")

        const acctoken = await accesstoken(user.id);
        const reftoken = await refreshtoken(user.id);

        res.send({acctoken,reftoken});
    } catch (error) {
        if(error.isJoi === true) return next(createerror.BadRequest('Invalid Username/Password'));
        next(error);
    }
}
exports.refresh_token = async(req, res, next)=>{
    try {
        const {refresh_token} = req.body;
        if(!refresh_token) throw createerror.BadRequest();
        const userid = await verifyrefreshtoken(refresh_token);

        const acctoken = await accesstoken(userid);
        res.send({acctoken});
    } catch (error) {
        next(error);
    }
}
exports.password_reset_request = async(req, res, next) => {
    try {
    const user = await user_model.findOne({email:req.body.email });
  
    if (!user) throw new Error("User does not exist");
    let token = await token_model.findOne({ userId: user._id });
    if (token) await token.deleteOne();
    let resettoken = crypto.randomBytes(32).toString("hex");
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(resettoken, salt);
  
    await new token_model({
      userid: user._id,
      token: hash,
      createdat: Date.now(),
    }).save();
  
    const userid = user._id;
    sendemail(user.email,"Password Reset Request","reset link");
    res.send({resettoken, userid})

  } catch (error) {
    next(error);
}
}
exports.resetpassword = async (req, res, next) => {
    try {
    let passwordresettoken = await token_model.findOne({ userid:req.body.userid });
    if (!passwordresettoken) {
      throw new Error("Invalid or expired password reset token");
    }
    const isvalid = await bcrypt.compare(req.body.resettoken, passwordresettoken.token);
    if (!isvalid) {
      throw new Error("Invalid or expired password reset token");
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(req.body.password, salt);
    await user_model.updateOne(
      { _id: req.body.userid },
      { $set: { password: hash } },
      { new: true }
    );
    const user = await user_model.findById({ _id: req.body.userid });
    sendemail(
      user.email,
      "Password Reset Successful",
    "reset success"
    );
    await passwordresettoken.deleteOne();
    res.json({"message":"success"})
} catch (error) {
    next(error);
}
  };

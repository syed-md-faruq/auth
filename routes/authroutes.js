const express = require('express');
const router = express.Router();
const {signup, login, refresh_token, password_reset_request, resetpassword} = require("../controllers/auth_controller");

router.post('/signup',signup);
router.post('/login',login);
router.post('/refresh-token',refresh_token);
router.delete('/logout',async(req, res, next)=>{
    res.send("logout route")
});
router.post('/password-reset-request', password_reset_request);
router.post('/reset-password', resetpassword)

module.exports = router;
const joi = require('@hapi/joi');

const authschema = joi.object({
    email: joi.string().email().lowercase().required(),
    password: joi.string().min(6).required()
})

module.exports = {authschema};
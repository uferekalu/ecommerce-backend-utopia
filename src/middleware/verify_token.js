const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();

module.exports =  {
    create_token : (id)=>{
        const token = jwt.sign({ _id_user: id}, 'dev_key')// process.env.JWT_KEY);
        return token;
    }
}
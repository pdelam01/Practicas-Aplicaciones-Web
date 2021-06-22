const bcrypt = require('bcryptjs');

const helpers = {};

//Se encripta la contraseña del usuario
helpers.encryptPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
};

//Se compara la contraseña con la guardada
helpers.matchPassword = async (password, savedPassword) => {
    try {
      return await bcrypt.compare(password, savedPassword);
      //return await (password === savedPassword);
    } catch (e) {
      console.log(e)
    }
};

module.exports = helpers;
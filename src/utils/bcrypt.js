const bcrypt = require('bcryptjs');

class Bcrypt {
  async hash(password) {
    try {
      const salt = await bcrypt.genSalt(10);
      return await bcrypt.hash(password, salt);
    } catch (error) {
      console.error('Error hashing password:', error);
      throw error;
    }
  }

  async compare(password, hash) {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      console.error('Error comparing password:', error);
      return false;
    }
  }
}

module.exports = new Bcrypt();
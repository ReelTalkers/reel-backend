import Sequelize from 'sequelize';
import _ from 'lodash';

const db = new Sequelize('database', null, null, {
  dialect: 'sqlite',
  storage: './database.sqlite'
});

const User = db.define('user', {
  userName: {
    type: Sequelize.STRING,
  },
  firstName: {
    type: Sequelize.STRING,
  },
  lastName: {
    type: Sequelize.STRING,
  },
});

User.sync({force: true}).then(function () {
  // Table created
  return User.create({
    userName: 'johncock',
    firstName: 'John',
    lastName: 'Hancock'
  });
});

export { User };

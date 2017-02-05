import Sequelize from 'sequelize';
import casual from 'casual';
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

db.sync({ force: true }).then(() => {
  _.times(2, () => {
    return User.create({
      userName: casual.username,
      firstName: casual.first_name,
      lastName: casual.last_name
    });
  });
});

export { User };

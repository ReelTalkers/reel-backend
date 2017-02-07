import Sequelize from 'sequelize';
import casual from 'casual';
import _ from 'lodash';

const db = new Sequelize('reel', null, null, {
  dialect: 'postgres',
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
  dateJoined: {
    type: Sequelize.DATE,
  }
});

const Person = db.define('person', {
  firstName: {
    type: Sequelize.STRING,
  },
  lastName: {
    type: Sequelize.STRING,
  },
});

casual.seed(123);
User.sync({ force: true }).then(() => {
  _.times(2, () => {
    return User.create({
      userName: casual.username,
      firstName: casual.first_name,
      lastName: casual.last_name,
      dateJoined: casual.date('YYYY-MM-DD HH:mm:ss')
    });
  });
});

Person.sync({ force: true }).then(() => {
  _.times(2, () => {
    return Person.create({
      firstName: casual.first_name,
      lastName: casual.last_name
    });
  });
});

export { User, Person };

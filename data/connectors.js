import Sequelize from 'sequelize';
import casual from 'casual';
import _ from 'lodash';
import rp from "request-promise";
var fs = require('fs');

var tmdbkey = fs.readFileSync('tmdbkey.key', 'utf8');
var guideboxkey = fs.readFileSync('guideboxkey.key', 'utf8')

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
  dateJoined: {
    type: Sequelize.DATE,
  },
  email: {
    type: Sequelize.STRING,
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

// See sequailize enums to update some of these fields
// .ARRAY is a type if we are using PostgreSQL (deal with genres then?)
const Media = db.define('media', {
  backdrop_path: {
    type: Sequelize.STRING
  },
  budget: {
    type: Sequelize.INTEGER
  },
  original_language: {
    type: Sequelize.STRING
  },
  overview: {
    type: Sequelize.TEXT
  },
  poster_path: {
    type: Sequelize.STRING
  },
  release_date: {
    type: Sequelize.STRING
  },
  revenue: {
    type: Sequelize.INTEGER
  },
  runtime: {
    type: Sequelize.INTEGER
  },
  status: {
    type: Sequelize.STRING
  },
  title: {
    type: Sequelize.STRING
  },
});

var movieOptions = {
    uri: 'http://api-public.guidebox.com/v2/',
    qs: {
        api_key: guideboxkey // -> uri + '?api_key=xxxxx%20xxxxx'
    },
    headers: {
        'User-Agent': 'Request-Promise'
    },
    json: true // Automatically parses the JSON string in the response
};

const Movie = {
  find(id) {
    movieOptions.uri = "http://api-public.guidebox.com/v2/movies/" + id
    return rp(movieOptions)
      .then((res) => {
        return res;
      });
  },
  findAll() {
    movieOptions.uri = "http://api-public.guidebox.com/v2/movies"
    return rp(movieOptions)
      .then((res) => {
        return res.results;
      });
  },
  search(query) {
    movieOptions.uri = "http://api-public.guidebox.com/v2/search?type=movie&field=title&query=" + query
    return rp(movieOptions)
      .then((res) => {
        return res.results;
      });
  }
}

casual.seed(123);
User.sync({ force: true }).then(() => {
  _.times(2, () => {
    return User.create({
      userName: casual.username,
      firstName: casual.first_name,
      lastName: casual.last_name,
      dateJoined: casual.date('YYYY-MM-DD HH:mm:ss'),
      email: casual.email
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

Media.sync({ force: true }).then(() => {
  _.times(2, () => {
    return Media.create({
        title: casual.title,
        rating: casual.first_name
    });
  });
});

export { User, Person, Media, Movie };

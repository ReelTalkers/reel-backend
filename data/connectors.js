import Sequelize from 'sequelize';
import casual from 'casual';
import _ from 'lodash';
import rp from "request-promise";
var fs = require('fs');
var mock = require('./mock.json');

var tmdbkey = fs.readFileSync('tmdbkey.key', 'utf8');
var guideboxkey = fs.readFileSync('guideboxkey.key', 'utf8')

const db = new Sequelize('database', null, null, {
  dialect: 'sqlite',
  storage: './database.sqlite'
});

// TODO: add some primary key types
const User = db.define('user', {
  userName: {
    type: Sequelize.STRING,
  },
  fullName: {
    type: Sequelize.STRING,
  },
  dateJoined: {
    type: Sequelize.DATE,
  },
  email: {
    type: Sequelize.STRING,
  },
  smallPhoto: {
    type: Sequelize.STRING,
  },
  completedWalkthrough: {
    type: Sequelize.BOOLEAN,
  },
  fbID: {
    type: Sequelize.STRING,
  }
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
  guideboxID: {
    type: Sequelize.INTEGER
  },
  id: {
    type: Sequelize.STRING, primaryKey: true
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
  tmdb_average: {
    type: Sequelize.FLOAT
  },
  tmdb_votes: {
    type: Sequelize.INTEGER
  }
});

const Review = db.define('review', {
  score: {
    type: Sequelize.INTEGER
  }
})

// I saw these added in some examples but I'm not sure why
//Review.belongsTo(Media, { foreignKey: { field:'mediaId', allowNull: false }, onDelete: 'CASCADE' });
Media.hasMany(Review, { foreignKey: { name:'mediaId', allowNull: false }, onDelete: 'CASCADE' });
//Review.belongsTo(User, { foreignKey: { field:'userId', allowNull: false }, onDelete: 'CASCADE' });
User.hasMany(Review, { foreignKey: { name:'userId', allowNull: false }, onDelete: 'CASCADE' });

const Person = db.define('person', {
  name: {
    type: Sequelize.STRING,
  },
  profile_path: {
    type: Sequelize.STRING,
  }
});

// Junction between people and movies for production roles
const Crew = db.define('crew', {
  department: {
    type: Sequelize.STRING
  },
  job: {
    type: Sequelize.STRING
  }
});

Media.hasMany(Crew, { foreignKey: { name:'mediaId', allowNull: false }, onDelete: 'CASCADE' });
Person.hasMany(Crew, { foreignKey: { name:'personId', allowNull: false }, onDelete: 'CASCADE' });

const Cast = db.define('cast', {
  character: {
    type: Sequelize.STRING
  },
  order: {
    type: Sequelize.INTEGER
  }
});

Person.hasMany(Cast, { foreignKey: { name:'personId', allowNull: false }, onDelete: 'CASCADE' });
Media.hasMany(Cast, { foreignKey: { name:'mediaId', allowNull: false }, onDelete: 'CASCADE' });

// Sync models we have declared with our database

casual.seed(123);
User.sync({ force: true }).then(() => {
    User.create(mock.user);
});

Person.sync({ force: false });

Review.sync({ force: true });

Media.sync({ force: false });

Cast.sync({force: false});
Crew.sync({force: false});

// We no longer use this, but it is still useful as an example for api queries
/*
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
*/

export { User, Person, Media, Review, Crew, Cast };

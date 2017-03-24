import Sequelize from 'sequelize';
import casual from 'casual';
import _ from 'lodash';
import rp from "request-promise";
var fs = require('fs');
var mock = require('./mock.json');

var tmdbkey = fs.readFileSync('tmdbkey.key', 'utf8');
var guideboxkey = fs.readFileSync('guideboxkey.key', 'utf8')
var databasekey = fs.readFileSync('database.key','utf8')
// Cut out the new line at the end of the file read for the db key
databasekey = databasekey.slice(0,-1)

const db = new Sequelize('reeldb', 'reelservice', databasekey, {
  host: 'localhost',
  port: 5432,
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
  },
  email: {
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
  genres: {
    type: Sequelize.ARRAY(Sequelize.STRING)
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
  production_companies: {
    type: Sequelize.ARRAY(Sequelize.STRING)
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
    type: Sequelize.FLOAT
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
const Credit = db.define('credit', {
  department: {
    type: Sequelize.STRING
  },
  job: {
    type: Sequelize.STRING
  }
});

Media.hasMany(Credit, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
Person.hasMany(Credit, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });

const Cast = db.define('cast', {
  character: {
    type: Sequelize.STRING
  },
  order: {
    type: Sequelize.INTEGER
  }
});

Person.hasMany(Cast, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
Media.hasMany(Cast, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });

// Sync models we have declared with our database

casual.seed(123);

// Reviews depend on users for foreign key constraints, so we have to make sure
//   the users relation is synced before we sync reviews. Other tables weren't conflicting
//   specifically media, because we aren't re-syncing it for now, but we may want to re-evaluate
//   in the future.
User.sync({ force: true }).then(() => {
  for(var user in mock.users) {
    User.create(mock.users[user]);
  }
}).then(() => {
  Review.sync({ force: true }).then(() => {
    for(var review in mock.reviews) {
      Review.create(mock.reviews[review]);
    }
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

Media.sync({ force: false });

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

export { User, Person, Media, Review };

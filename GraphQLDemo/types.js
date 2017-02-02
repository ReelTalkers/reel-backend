import { GraphQLScalarType } from 'graphql';

var serializeDate = function(value) {
  return value.month + '/' + value.day + "/" + value.year;
}

module.exports = {
  date: new GraphQLScalarType({
      name: "Date",
      serialize: serializeDate,
  }),
}

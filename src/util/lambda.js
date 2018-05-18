const response = body => ({
  statusCode: 200,
  headers: {
    "Access-Control-Allow-Origin": "*"
  },
  body: JSON.stringify(body)
});

// creates a simpler lambda interface with generic error handling capabilities
const lambda = fn => {
  return async (event, context, callback) => {
    try {
      await fn(event, success => callback(null, response(success)));
    } catch (error) {
      console.error(JSON.stringify({ error: error.toString(), event }));
      callback("an error occurred - bad luck!");
    }
  };
};

module.exports = lambda;

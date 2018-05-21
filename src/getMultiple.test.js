console.error = console.log = jest.fn();

jest.setMock("./util/persistence", {
  getItems: urls => {
    return Promise.resolve(
      urls.map(url => ({
        url,
        claps: 10
      }))
    );
  }
});

const getMultiple = require("./getMultiple").fn;

test("returns the correct response", done => {
  const urls = ["google.com", "microsoft.com"];
  getMultiple({ body: urls }, undefined, (error, response) => {
    const body = JSON.parse(response.body);
    expect(body.length).toBe(2);
    done();
  });
});

test("validates that the request is an array", done => {
  getMultiple({ body: "fish" }, undefined, (error, response) => {
    expect(error).toBe("an error occurred - bad luck!");
    done();
  });
});

test("limits the request to 100 URLs", done => {
  const urls = [];
  for (var i = 0; i < 200; i++) {
    urls.push("google.com");
  }
  getMultiple({ body: urls }, undefined, (error, response) => {
    const body = JSON.parse(response.body);
    expect(body.length).toBe(100);
    done();
  });
});

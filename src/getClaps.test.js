console.error = console.log = jest.fn();

const URL = "http://foo.com";

jest.setMock("./util/persistence", {
  getItem: url => {
    if (url === URL) {
      return Promise.resolve({
        Item: { claps: 4 }
      });
    } else {
      return Promise.resolve({
        Item: undefined
      });
    }
  }
});

const getClaps = require("./getClaps").fn;

const eventWithReferer = Referer => ({
  headers: { Referer }
});

test("returns the correct number of claps", done => {
  getClaps(eventWithReferer(URL), undefined, (error, response) => {
    expect(response.body).toBe("4");
    done();
  });
});

test("validates that a Referer is set", done => {
  getClaps(eventWithReferer(), undefined, (error, response) => {
    expect(error).toBe("an error occurred - bad luck!");
    done();
  });
});

test("returns zero claps for an unknown URL", done => {
  getClaps(eventWithReferer("http://fish.com"), undefined, (error, response) => {
    expect(response.body).toBe("0");
    done();
  });
});

test("validates that the referer is a URL", done => {
  getClaps(eventWithReferer("cat"), undefined, (error, response) => {
    expect(error).toBe("an error occurred - bad luck!");
    done();
  });
});

console.error = console.log = jest.fn();

const clapStore = {
  "http://foo.com": 1,
  "http://bar.com": 10
};

jest.setMock("./util/persistence", {
  getItem: url => {
    return Promise.resolve(
      clapStore[url]
        ? {
            Item: { claps: clapStore[url] }
          }
        : {}
    );
  },
  incrementClaps: (url, claps) => {
    clapStore[url] += claps;
    return Promise.resolve({
      Item: { claps: clapStore[url] }
    });
  },
  putItem: (url, claps) => {
    clapStore[url] = claps;
    return Promise.resolve({
      Item: { claps: clapStore[url] }
    });
  }
});

const updateClaps = require("./updateClaps").fn;

const eventWithReferer = Referer => ({
  headers: { Referer }
});

test("increments existing clap counts", done => {
  updateClaps(
    { ...eventWithReferer("http://foo.com"), body: 1 },
    undefined,
    (error, response) => {
      expect(clapStore["http://foo.com"]).toBe(2);
      expect(response.body).toBe("2");
      done();
    }
  );
});

test("clamps the provided clap count", done => {
  updateClaps(
    { ...eventWithReferer("http://bar.com"), body: 100 },
    undefined,
    (error, response) => {
      expect(clapStore["http://bar.com"]).toBe(20);
      expect(response.body).toBe("20");
      done();
    }
  );
});

test("validates that the referer is a URL", done => {
  updateClaps(eventWithReferer("cat"), undefined, (error, response) => {
    expect(error).toBe("an error occurred - bad luck!");
    done();
  });
});

test("validates that the body is a number", done => {
  updateClaps(
    { ...eventWithReferer("http://bar.com"), body: "fish" },
    undefined,
    (error, response) => {
      expect(error).toBe("an error occurred - bad luck!");
      done();
    }
  );
});

test("inserts a new item if the given URL has not been incremented before", done => {
  updateClaps(
    { ...eventWithReferer("http://baz.com"), body: 10 },
    undefined,
    (error, response) => {
      expect(clapStore["http://baz.com"]).toBe(10);
      expect(response.body).toBe("10");
      done();
    }
  );
});

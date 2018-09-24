console.error = console.log = jest.fn();

let clapStore;

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

describe("v1 API", () => {
  beforeEach(() => {
    process.env.WHITELIST_URLS = JSON.stringify([
      "foo.com",
      "bar.com",
      "baz.com"
    ]);
    clapStore = {
      "foo.com": 1,
      "bar.com": 10
    };
  });

  test("increments existing clap counts", done => {
    updateClaps(
      { ...eventWithReferer("foo.com"), body: 1 },
      undefined,
      (error, response) => {
        expect(clapStore["foo.com"]).toBe(2);
        expect(response.body).toBe("2");
        done();
      }
    );
  });

  test("clamps the provided clap count", done => {
    updateClaps(
      { ...eventWithReferer("bar.com"), body: 100 },
      undefined,
      (error, response) => {
        expect(clapStore["bar.com"]).toBe(20);
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
      { ...eventWithReferer("bar.com"), body: "fish" },
      undefined,
      (error, response) => {
        expect(error).toBe("an error occurred - bad luck!");
        done();
      }
    );
  });

  test("inserts a new item if the given URL has not been incremented before", done => {
    updateClaps(
      { ...eventWithReferer("baz.com"), body: 10 },
      undefined,
      (error, response) => {
        expect(clapStore["baz.com"]).toBe(10);
        expect(response.body).toBe("10");
        done();
      }
    );
  });
});

describe("v2 API", () => {
  beforeEach(() => {
    process.env.WHITELIST_URLS = JSON.stringify([]);
    clapStore = {
      "foo.com": 1,
      "bar.com": 10
    };
  });

  const WAVELENGTH = 60 * 5;
  const secondsForClap = a => (WAVELENGTH * Math.asin(a / 10)) / (Math.PI * 2);

  test("increments existing clap counts", done => {
    Date.now = jest.genMockFunction().mockReturnValue(18000);

    // let's update by 6 claps
    const requiredSeconds = secondsForClap(6);
    const serverSeconds = (Date.now() / 1000) % 60;
    const delta = requiredSeconds - serverSeconds;

    // add the anticipated latency
    Date.now = jest.genMockFunction().mockReturnValue(18000 + 100);

    updateClaps(
      { ...eventWithReferer("foo.com"), body: delta },
      undefined,
      (error, response) => {
        expect(clapStore["foo.com"]).toBe(7);
        expect(response.body).toBe("7");
        done();
      }
    );
  });
});

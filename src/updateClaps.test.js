console.error = console.log = jest.fn();

let clapStore;

jest.setMock("./util/persistence", {
  getItem: url => {
    return Promise.resolve(
      clapStore[url]
        ? {
            Item: { ...clapStore[url] }
          }
        : {}
    );
  },
  incrementClaps: (url, claps, sourceIp) => {
    clapStore[url].claps += claps;
    clapStore[url].sourceIp = sourceIp;
    return Promise.resolve({
      Item: { claps: clapStore[url] }
    });
  },
  putItem: (url, claps, sourceIp) => {
    clapStore[url] = {
      claps,
      sourceIp
    };
    return Promise.resolve({
      Item: { claps: clapStore[url] }
    });
  }
});

const updateClaps = require("./updateClaps").fn;

const eventWithReferer = (Referer, sourceIp = "1.2.3.4") => ({
  headers: { Referer },
  requestContext: {
    identity: { sourceIp }
  }
});

beforeEach(() => {
  clapStore = {
    "foo.com": {
      claps: 1,
      sourceIp: "0.0.0.0"
    },
    "bar.com": {
      claps: 10,
      sourceIp: "0.0.0.0"
    }
  };
});

const foo = data =>
  new Promise((resolve, reject) => {
    updateClaps(data, undefined, (error, response) => {
      resolve(response);
    });
  });

test("prevents multiple updates from the same IP", async done => {
  // clap once
  let response = await foo({
    ...eventWithReferer("foo.com", "1.5.6.7"),
    body: 1
  });

  expect(clapStore["foo.com"].claps).toBe(2);
  expect(response.body).toBe("2");

  console.log(clapStore);

  // clap again from the same IP
  response = await foo({
    ...eventWithReferer("foo.com", "1.5.6.7"),
    body: 1
  });

  expect(clapStore["foo.com"].claps).toBe(2);
  expect(response.body).toBe("2");

  done();
});

test("increments existing clap counts", done => {
  updateClaps(
    { ...eventWithReferer("foo.com"), body: 1 },
    undefined,
    (error, response) => {
      expect(clapStore["foo.com"].claps).toBe(2);
      expect(response.body).toBe("2");
      done();
    }
  );
});

test("clamps the provided clap count to upper bound", done => {
  updateClaps(
    { ...eventWithReferer("bar.com"), body: 100 },
    undefined,
    (error, response) => {
      expect(clapStore["bar.com"].claps).toBe(20);
      expect(response.body).toBe("20");
      done();
    }
  );
});

test("clamps the provided clap count to lower bound", done => {
  updateClaps(
    // this tests the v2.0.0 behaviour with temporal offsets - the idea
    // being that for peopel that have not migrated to v3.0.0, we still want to 
    // increment claps
    { ...eventWithReferer("bar.com"), body: -39.95835787266851 },
    undefined,
    (error, response) => {
      expect(clapStore["bar.com"].claps).toBe(11);
      expect(response.body).toBe("11");
      done();
    }
  );
});

test("allows requests where the body is a string", done => {
  updateClaps(
    { ...eventWithReferer("foo.com"), body: "4" },
    undefined,
    (error, response) => {
      expect(clapStore["foo.com"].claps).toBe(5);
      expect(response.body).toBe("5");
      done();
    }
  );
});

test("allows requests where the body also contains a version number", done => {
  updateClaps(
    { ...eventWithReferer("foo.com"), body: "4,v3.0.0" },
    undefined,
    (error, response) => {
      expect(clapStore["foo.com"].claps).toBe(5);
      expect(response.body).toBe("5");
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
      expect(clapStore["baz.com"].claps).toBe(10);
      expect(response.body).toBe("10");
      done();
    }
  );
});

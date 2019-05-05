const Keystone = require('../lib/Keystone');
const List = require('../lib/List');

class MockType {
  extendViews(views) {
    return views;
  }
}

class MockFieldAdapter {}

class MockListAdapter {
  newFieldAdapter = () => new MockFieldAdapter();
}

class MockAdapter {
  name = 'mock';
  newListAdapter = () => new MockListAdapter();
}

test('Check require', () => {
  expect(Keystone).not.toBeNull();
});

test('new Keystone()', () => {
  const config = {
    name: 'Jest Test',
    adapter: new MockAdapter(),
  };
  const keystone = new Keystone(config);
  expect(keystone.name).toEqual(config.name);
});

test('unique typeDefs', () => {
  class MockFileType {
    constructor() {
      this.access = {
        create: true,
        read: true,
        update: true,
        delete: true,
      };
      this.config = {};
    }
    getGqlAuxTypes() {
      return ['scalar Foo'];
    }
    get gqlOutputFields() {
      return ['foo: Boolean'];
    }
    get gqlQueryInputFields() {
      return ['zip: Boolean'];
    }
    get gqlUpdateInputFields() {
      return ['zap: Boolean'];
    }
    get gqlCreateInputFields() {
      return ['quux: Boolean'];
    }
    getGqlAuxQueries() {
      return ['getFoo: Boolean'];
    }
    getGqlAuxMutations() {
      return ['mutateFoo: Boolean'];
    }
    extendViews(views) {
      return views;
    }
  }

  const config = {
    adapter: new MockAdapter(),
    name: 'Jest Test for typeDefs',
  };
  const keystone = new Keystone(config);

  keystone.createList('User', {
    fields: {
      images: {
        type: {
          implementation: MockFileType,
          views: {},
          adapters: { mock: MockFieldAdapter },
        },
      },
    },
  });

  keystone.createList('Post', {
    fields: {
      hero: {
        type: {
          implementation: MockFileType,
          views: {},
          adapters: { mock: MockFieldAdapter },
        },
      },
    },
  });

  const schema = keystone.getTypeDefs().join('\n');
  expect(schema.match(/scalar Foo/g) || []).toHaveLength(1);
  expect(schema.match(/getFoo: Boolean/g) || []).toHaveLength(1);
  expect(schema.match(/mutateFoo: Boolean/g) || []).toHaveLength(1);
});

describe('Keystone.createList()', () => {
  test('basic', () => {
    const config = {
      adapter: new MockAdapter(),
      name: 'Jest Test',
    };
    const keystone = new Keystone(config);

    expect(keystone.lists).toEqual({});
    expect(keystone.listsArray).toEqual([]);

    keystone.createList('User', {
      fields: {
        name: {
          type: {
            implementation: MockType,
            views: {},
            adapters: { mock: MockFieldAdapter },
          },
        },
        email: {
          type: {
            implementation: MockType,
            views: {},
            adapters: { mock: MockFieldAdapter },
          },
        },
      },
    });

    expect(keystone.lists).toHaveProperty('User');
    expect(keystone.lists['User']).toBeInstanceOf(List);
    expect(keystone.listsArray).toHaveLength(1);
    expect(keystone.listsArray[0]).toBeInstanceOf(List);

    expect(keystone.listsArray[0]).toBe(keystone.lists['User']);
  });

  /* eslint-disable jest/no-disabled-tests */
  describe('access control config', () => {
    test.failing('expands shorthand acl config', () => {
      expect(false).toBe(true);
    });

    test.failing('throws error when one of create/read/update/delete not set on object', () => {
      expect(false).toBe(true);
    });

    test.failing('throws error when create/read/update/delete are not correct type', () => {
      expect(false).toBe(true);
    });
  });
  /* eslint-enable jest/no-disabled-tests */
});

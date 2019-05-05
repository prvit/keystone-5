const keystone = require('@keystone-alpha/core');

const { port, staticRoute, staticPath } = require('./config');

const { initialData, initialPosts } = require('./data');

const initialiseLists = (keystoneApp, initialData) => {
  return Promise.all(
    Object.entries(initialData).map(([listName, items]) => {
      const list = keystoneApp.lists[listName];
      return keystoneApp.executeQuery({
        query: `mutation ($items: [${list.gqlNames.createManyInputName}]) { ${
          list.gqlNames.createManyMutationName
        }(data: $items) { id } }`,
        schemaName: 'admin',
        variables: { items: items.map(d => ({ data: d })) },
      });
    })
  );
};

keystone
  .prepare({ port })
  .then(async ({ server, keystone: keystoneApp }) => {
    await keystoneApp.connect(process.env.MONGODB_URI);

    // Initialise some data.
    // NOTE: This is only for test purposes and should not be used in production
    const users = await keystoneApp.lists.User.adapter.findAll();
    if (!users.length) {
      Object.values(keystoneApp.adapters).forEach(async adapter => {
        await adapter.dropDatabase();
      });
      await initialiseLists(keystoneApp, initialData);
      await initialiseLists(keystoneApp, initialPosts);
    }

    server.app.get('/reset-db', async (req, res) => {
      Object.values(keystoneApp.adapters).forEach(async adapter => {
        await adapter.dropDatabase();
      });
      await initialiseLists(keystoneApp, initialData);
      await initialiseLists(keystoneApp, initialPosts);
      res.redirect('/admin');
    });
    server.app.use(staticRoute, server.express.static(staticPath));
    await server.start();
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

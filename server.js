require('dotenv').config();
const Koa = require('koa');
const { ApolloServer } = require('apollo-server-koa');
const Router = require('koa-router');
const cors = require('@koa/cors');
const jwt = require('jsonwebtoken');
const connectDB = require('./db/connect');
const typeDefs = require('./schema');
const resolvers = require('./resolver');
const User = require('./models/User');

connectDB(process.env.MONGO_URI);

const app = new Koa();
app.use(cors({ credentials: true }));
const router = new Router();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ ctx }) => {
    const auth = ctx.headers.authorization;
    let currentUser = null;

    if (auth && auth.startsWith('Bearer ')) {
      const token = auth.substring(7);
      try {
        const decodedToken = jwt.verify(token, process.env.SECRET);
        currentUser = await User.findById(decodedToken.id);
      } catch (error) {
        console.error('There was an error with authentication', error);
      }
    }
    return { currentUser, ctx };
  },
});

async function startServer() {
  await server.start();

  server.applyMiddleware({ app });

  router.get('/api/v1', async (ctx) => {
    ctx.body = 'Hello World';
  });
  app.use(router.routes()).use(router.allowedMethods());

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () =>
    console.log(
      `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
    )
  );
}

startServer().catch((err) => console.error('Server failed to start', err));

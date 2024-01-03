const { GraphQLError } = require('graphql');
const { PubSub } = require('graphql-subscriptions');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pubsub = new PubSub();

const mongoose = require('mongoose');

const User = require('./models/User');
const Client = require('./models/Client');
const Category = require('./models/Category');
const Subgroup = require('./models/Subgroup');
const Process = require('./models/Process');
const ClientSpecificSettings = require('./models/ClientSpecificSettings');

const resolvers = {
  Query: {
    hello: () => {
      return 'world';
    },
    users: async () => {
      try {
        const users = User.find({});
        return users;
      } catch (error) {
        throw new GraphQLError('Database retrieval error', {
          extensions: {
            code: 'DATABASE_ERROR',
            errorMessage: error.message,
          },
        });
      }
    },
    usersCount: async () => {
      try {
        const count = await User.collection.countDocuments();
        return count;
      } catch (error) {
        throw new GraphQLError('Database retrieval error', {
          extensions: {
            code: 'DATABASE_ERROR',
            errorMessage: error.message,
          },
        });
      }
    },
    singleUser: async (root, args) => {
      try {
        const user = await User.findById(args.userId);
        if (!user) {
          throw new GraphQLError('User not found', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.userId,
            },
          });
        }
        return user;
      } catch (error) {
        throw new GraphQLError('Database retrieval error', {
          extensions: {
            code: 'DATABASE_ERROR',
            errorMessage: error.message,
          },
        });
      }
    },
    clients: async () => {
      try {
        const clients = Client.find({});
        return clients;
      } catch (error) {
        throw new GraphQLError('Database retrieval error', {
          extensions: {
            code: 'BAD_USER_INPUT',
            errorMessage: error.message,
          },
        });
      }
    },
    clientDetail: async (root, { clientId }) => {
      if (!mongoose.Types.ObjectId.isValid(clientId)) {
        throw new GraphQLError('Invalid client ID', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: clientId,
          },
        });
      }
      try {
        const client = await Client.findById(clientId).populate({
          path: 'processGroups',
          populate: {
            path: 'subgroups',
            populate: {
              path: 'processes',
            },
          },
        });

        if (!client) {
          throw new GraphQLError('Client not found', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: clientId,
            },
          });
        }

        return client;
      } catch (error) {
        throw new GraphQLError('Database retrieval error', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: clientId,
            errorMessage: error.message,
          },
        });
      }
    },
    clientsCount: async () => {
      try {
        const count = await Client.collection.countDocuments();
        return count;
      } catch (error) {
        throw new GraphQLError('Database retrieval error', {
          extensions: {
            code: 'BAD_USER_INPUT',
            errorMessage: error.message,
          },
        });
      }
    },
    findClient: async (root, args) => {
      try {
        const client = await Client.findById(args.clientId).populate({
          path: 'processGroups',
          populate: {
            path: 'subgroups',
            populate: {
              path: 'processes',
            },
          },
        });
        return client;
      } catch (error) {
        throw new GraphQLError('Database retrieval error', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.clientId,
            errorMessage: error.message,
          },
        });
      }
    },
    categories: async () => {
      try {
        const categories = Category.find({}).populate({
          path: 'subgroups',
          populate: {
            path: 'processes',
          },
        });
        return categories;
      } catch (error) {
        throw new GraphQLError('Database retrieval error', {
          extensions: {
            code: 'BAD_USER_INPUT',
            errorMessage: error.message,
          },
        });
      }
    },
    findCategory: async (root, { categoryId }) => {
      try {
        const category = await Category.findById(categoryId).populate({
          path: 'subgroups',
          populate: {
            path: 'processes',
          },
        });

        return category;
      } catch (error) {
        throw new GraphQLError('Database retrieval error', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: categoryId,
            errorMessage: error.message,
          },
        });
      }
    },
    subgroups: async () => {
      try {
        const subgroups = Subgroup.find({});
        return subgroups;
      } catch (error) {
        throw new GraphQLError('Database retrieval error', {
          extensions: {
            code: 'BAD_USER_INPUT',
            errorMessage: error.message,
          },
        });
      }
    },
    processes: async () => {
      try {
        const processes = Process.find({});
        return processes;
      } catch (error) {
        throw new GraphQLError('Database retrieval error', {
          extensions: {
            code: 'BAD_USER_INPUT',
            errorMessage: error.message,
          },
        });
      }
    },
    me: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new GraphQLError('Authentication required', {
          extensions: {
            code: 'AUTHENTICATION_REQUIRED',
            message: 'You must be logged in to access this information',
          },
        });
      }

      return currentUser;
    },
    getVisibleCategoriesForClient: async (_, { clientId }) => {
      const settings = await ClientSpecificSettings.findOne({
        clientId: clientId,
      });
      if (!settings) {
        return await Category.find({}).populate({
          path: 'subgroups',
          populate: {
            path: 'processes',
          },
        });
      }

      return await Category.find({
        _id: {
          $nin: settings.hiddenEntities
            .filter((e) => e.entityType === 'Category')
            .map((e) => e.entityId),
        },
        hidden: false,
      }).populate({
        path: 'subgroups',
        populate: {
          path: 'processes',
        },
      });
    },
  },
  Mutation: {
    createUser: async (root, args) => {
      try {
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(args.password, saltRounds);

        const existingUser = await User.findOne({ email: args.email });

        if (existingUser) {
          throw new GraphQLError('User already exists', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.email,
            },
          });
        }

        const role = (await User.countDocuments({})) === 0 ? 'admin' : 'user';

        const user = new User({
          email: args.email,
          passwordHash,
          profileImage: args.profileImage,
          description: args.description,
          role,
        });

        return user.save();
      } catch (error) {
        throw new GraphQLError('Creating the user failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.email,
            errorMessage: error.message,
          },
        });
      }
    },
    login: async (root, args, { ctx, currentUser }) => {
      const user = await User.findOne({ email: args.email });

      if (!user) {
        throw new GraphQLError('Wrong credentials', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        });
      }

      const passwordCorrect =
        user === null
          ? false
          : await bcrypt.compare(args.password, user.passwordHash);

      if (!passwordCorrect) {
        throw new GraphQLError('Wrong credentials', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        });
      }

      const userForToken = {
        email: user.email,
        role: user.role,
        id: user._id,
      };

      const accessToken = jwt.sign(userForToken, process.env.SECRET, {
        expiresIn: '15m',
      });
      const refreshToken = jwt.sign(
        userForToken,
        process.env.REFRESH_TOKEN_SECRET,
        {
          expiresIn: '7d',
        }
      );

      ctx.cookies.set('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: 'lax',
      });

      return {
        value: accessToken,
      };
    },
    usersFilter: async (root, { filter, sort }) => {
      try {
        let query = {};
        if (filter.email) {
          query.email = { $regex: filter.email, $options: 'i' };
        }

        let users = await User.find(query);

        if (filter.isFavorite) {
          users = users.filter(
            (user) =>
              (user.favorites && user.favorites.length > 0) ===
              filter.isFavorite
          );
        }

        if (sort && sort.field && sort.order) {
          users = users.sort((a, b) => {
            let fieldA = a[sort.field];
            let fieldB = b[sort.field];
            if (fieldA < fieldB) return sort.order === 'asc' ? -1 : 1;
            if (fieldA > fieldB) return sort.order === 'asc' ? 1 : -1;
            return 0;
          });
        }

        return users;
      } catch (error) {
        throw new GraphQLError('Database retrieval error', {
          extensions: {
            code: 'DATABASE_ERROR',
            errorMessage: error.message,
          },
        });
      }
    },
    addClient: async (root, args) => {
      try {
        const client = new Client({
          name: args.name,
        });

        const savedClient = await client.save();
        return savedClient;
      } catch (error) {
        throw new GraphQLError('Creating the client failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            errorMessage: error.message,
          },
        });
      }
    },
    addCategory: async (root, args) => {
      try {
        const category = new Category({
          name: args.name,
        });

        const savedCategory = await category.save();
        return savedCategory;
      } catch (error) {
        throw new GraphQLError('Creating the category failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            errorMessage: error.message,
          },
        });
      }
    },
    addCategoryToClient: async (root, args) => {
      try {
        const category = await Category.findOne({
          name: args.name,
        });
        if (!category) {
          throw new GraphQLError('Category not found', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.name,
            },
          });
        }

        const client = await Client.findById(args.clientId);
        if (!client) {
          throw new GraphQLError('Client not found', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.clientId,
            },
          });
        }
        client.processGroups.push(category._id);
        await client.save();

        return client;
      } catch (error) {
        throw new GraphQLError('Adding category to client failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: [args.name, args.clientId],
            errorMessage: error.message,
          },
        });
      }
    },
    addCategoryToMultipleClients: async (root, { categoryId, clientIds }) => {
      try {
        const category = await Category.findById(categoryId);
        if (!category) {
          throw new GraphQLError('Category not found', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: categoryId,
            },
          });
        }

        let updatedClients = [];

        for (const clientId of clientIds) {
          const client = await Client.findById(clientId);
          if (!client) {
            throw new GraphQLError('Client not found', {
              extensions: {
                code: 'BAD_USER_INPUT',
                invalidArgs: clientId,
              },
            });
            continue;
          }
          client.processGroups.push(category._id);
          const savedClient = await client.save();

          updatedClients.push(savedClient);
        }

        return updatedClients;
      } catch (error) {
        throw new GraphQLError('Adding category to multiple clients failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: [categoryId, clientIds],
            errorMessage: error.message,
          },
        });
      }
    },
    addSubgroup: async (root, args) => {
      try {
        const subgroup = new Subgroup({
          name: args.name,
          categoryId: args.categoryId,
        });

        const savedSubgroup = await subgroup.save();

        const category = await Category.findById(args.categoryId);
        category.subgroups.push(savedSubgroup);
        await category.save();

        return subgroup;
      } catch (error) {
        throw new GraphQLError('Creating the subgroup failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            errorMessage: error.message,
          },
        });
      }
    },
    addProcess: async (root, args) => {
      try {
        const process = new Process({
          name: args.name,
          subgroupId: args.subgroupId,
        });

        const savedProcess = await process.save();

        const subgroup = await Subgroup.findById(args.subgroupId);
        subgroup.processes.push(savedProcess);
        await subgroup.save();

        return process;
      } catch (error) {
        throw new GraphQLError('Creating the process failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            errorMessage: error.message,
          },
        });
      }
    },
    addFavorite: async (root, args) => {
      try {
        const client = await Client.findById(args.clientId);
        const user = await User.findById(args.userId);

        if (!user || !client) {
          throw new GraphQLError('User or client not found', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: [args.userId, args.clientId],
            },
          });
        }

        user.favorites.push(client._id);
        await user.save();

        return user;
      } catch (error) {
        throw new GraphQLError('Adding favorite failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: [args.userId, args.clientId],
            errorMessage: error.message,
          },
        });
      }
    },
    toggleFavorite: async (root, args) => {
      try {
        const user = await User.findById(args.userId);
        const index = user.favorites.indexOf(args.clientId);
        if (index === -1) {
          user.favorites.push(args.clientId);
        } else {
          user.favorites.splice(index, 1);
        }

        const updatedUser = await user.save();
        return updatedUser;
      } catch (error) {
        throw new GraphQLError('Toggling favorite failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: [args.userId, args.clientId],
            errorMessage: error.message,
          },
        });
      }
    },
    reassignCategory: async (root, args) => {
      try {
        const category = await Category.findById(args.categoryId);
        if (!category) {
          throw new GraphQLError('Category not found', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.categoryId,
            },
          });
        }

        const oldClient = await Client.findById(args.oldClientId);
        if (oldClient) {
          oldClient.processGroups = oldClient.processGroups.filter(
            (category) => category._id.toString() !== args.categoryId
          );
        }

        const newClient = await Client.findById(args.newClientId);
        if (!newClient) {
          throw new GraphQLError('New client not found', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.newClientId,
            },
          });
        }

        if (!newClient.processGroups.includes(args.categoryId)) {
          newClient.processGroups.push(args.categoryId);
          await newClient.save();
        }

        return category;
      } catch (error) {
        throw new GraphQLError('Reassigning category failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: [args.categoryId, args.oldClientId, args.newClientId],
            errorMessage: error.message,
          },
        });
      }
    },
    reassignSubgroup: async (root, args) => {
      try {
        const subgroup = await Subgroup.findById(args.subgroupId);

        if (!subgroup) {
          throw new GraphQLError('Subgroup or category not found', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.subgroupId,
            },
          });
        }
        const oldCategory = await Category.findById(subgroup.oldCategoryId);
        if (oldCategory) {
          oldCategory.subgroups = oldCategory.subgroups.filter(
            (subgroup) => subgroup._id.toString() !== args.subgroupId
          );
          await oldCategory.save();
        }
        const newCategory = await Category.findById(args.newCategoryId);

        if (!newCategory) {
          throw new GraphQLError('New category not found', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.newCategoryId,
            },
          });
        }

        if (!newCategory.subgroups.includes(args.subgroupId)) {
          newCategory.subgroups.push(args.subgroupId);
          await newCategory.save();
        }

        return subgroup;
      } catch (error) {
        throw new GraphQLError('Error reassigning category', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: [
              args.subgroupId,
              args.newCategoryId,
              args.oldCategoryId,
            ],
            errorMessage: error.message,
          },
        });
      }
    },
    reassignProcess: async (
      root,
      { oldSubgroupId, newSubgroupId, processId }
    ) => {
      try {
        const process = await Process.findById(processId);
        if (!process) {
          throw new GraphQLError('Process not found', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: processId,
            },
          });
        }

        const oldSubgroup = await Subgroup.findById(oldSubgroupId);
        if (oldSubgroup) {
          oldSubgroup.processes = oldSubgroup.processes.filter(
            (process) => process._id.toString() !== processId
          );
          await oldSubgroup.save();
        }

        const newSubgroup = await Subgroup.findById(newSubgroupId);
        if (!newSubgroup.processes.includes(processId)) {
          newSubgroup.processes.push(processId);
          await newSubgroup.save();
        }

        return process;
      } catch (error) {
        throw new GraphQLError('Error reassigning process', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: [oldSubgroupId, newSubgroupId, processId],
            errorMessage: error.message,
          },
        });
      }
    },
    batchAddProcesses: async (root, { processIds, subgroupId }) => {
      try {
        const subgroup = await Subgroup.findById(subgroupId);
        if (!subgroup) {
          throw new GraphQLError('Subgroup not found', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: subgroupId,
            },
          });
        }

        let processesToMove = await Process.find({ _id: { $in: processIds } });
        if (!processesToMove.length) {
          throw new GraphQLError('No valid processes found for given IDs', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: processIds,
            },
          });
        }

        processesToMove.forEach((process) => {
          if (!subgroup.processes.includes(process._id)) {
            subgroup.processes.push(process._id);
          }
        });

        await subgroup.save();

        return processesToMove;
      } catch (error) {
        throw new GraphQLError('Error reassigning processes', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: [subgroupId, processIds],
            errorMessage: error.message,
          },
        });
      }
    },
    toggleCategory: async (root, args) => {
      try {
        const category = await Category.findById(args.categoryId);

        if (!category) {
          throw new GraphQLError('Category not found', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.categoryId,
            },
          });
        }

        category.hidden = !category.hidden;

        await category.save();
        return category;
      } catch (error) {
        throw new GraphQLError('Error hiding category', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.categoryId,
            errorMessage: error.message,
          },
        });
      }
    },
    toggleSubgroup: async (root, args) => {
      try {
        const subgroup = await Subgroup.findById(args.subgroupId);

        if (!subgroup) {
          throw new GraphQLError('Category not found', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.subgroupId,
            },
          });
        }

        subgroup.hidden = !subgroup.hidden;

        await subgroup.save();
        return subgroup;
      } catch (error) {
        throw new GraphQLError('Error hiding category', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.subgroupId,
            errorMessage: error.message,
          },
        });
      }
    },
    toggleProcess: async (root, args) => {
      try {
        const process = await Process.findById(args.processId);

        if (!process) {
          throw new GraphQLError('Category not found', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.processId,
            },
          });
        }

        process.hidden = !process.hidden;

        await process.save();
        return process;
      } catch (error) {
        throw new GraphQLError('Error hiding category', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.processId,
            errorMessage: error.message,
          },
        });
      }
    },
    hideEntityForClient: async (
      _,
      { userId, clientId, entityId, entityType }
    ) => {
      try {
        let settings = await ClientSpecificSettings.findOne({
          clientId,
          userId,
        });

        if (!settings) {
          settings = new ClientSpecificSettings({
            clientId,
            userId,
            hiddenEntities: [
              {
                entityId,
                entityType,
                hidden: true,
              },
            ],
          });
        }

        const hiddenEntityIndex = settings.hiddenEntities.findIndex(
          (he) => he.entityId.equals(entityId) && he.entityType === entityType
        );

        if (hiddenEntityIndex === -1) {
          settings.hiddenEntities.push({
            entityId: entityId,
            entityType: entityType,
            hidden: true,
          });
        } else {
          settings.hiddenEntities[hiddenEntityIndex].hidden = true;
        }

        await settings.save();
        return settings;
      } catch (error) {
        throw new GraphQLError('Error updating client specific settings', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            errorMessage: error.message,
          },
        });
      }
    },
  },
};

module.exports = resolvers;

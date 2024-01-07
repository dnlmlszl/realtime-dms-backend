require('dotenv').config();
const mongoose = require('mongoose');
const Subgroup = require('./models/Subgroup');
const Process = require('./models/Process');

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
    return Promise.all([
      Subgroup.updateMany({}, { $set: { hidden: false } }, { multi: true }),
      Process.updateMany({}, { $set: { hidden: false } }, { multi: true }),
    ]);
  })
  .then(() => {
    console.log('Database updated successfully');
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error('Error updating database', err);
    mongoose.connection.close();
  });

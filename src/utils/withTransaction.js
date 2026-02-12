const mongoose = require("mongoose");

module.exports = (logic) => async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await logic(session, req, res);
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

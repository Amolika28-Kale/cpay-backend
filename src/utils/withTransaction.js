const mongoose = require("mongoose");

module.exports = (logic) => async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await logic(session, req, res);
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
  } finally {
    session.endSession();
  }
};

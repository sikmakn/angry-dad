import mongoose from 'mongoose';

describe('MongoDB test environment', () => {
  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('supports transactions (replica set)', async () => {
    await mongoose.connect(process.env.MONGODB_URI as string);
    const session = await mongoose.connection.startSession();
    await session.withTransaction(async () => {
      await mongoose.connection.collection('smoke').insertOne({ ok: true }, { session });
    });
    await session.endSession();
    expect(await mongoose.connection.collection('smoke').countDocuments({ ok: true })).toBe(1);
  });
});

import mongoConnect from './mongo'

async function dbConnect(): Promise<void> {
  await mongoConnect()
}

export default dbConnect

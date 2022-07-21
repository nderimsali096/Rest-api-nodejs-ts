import mongoose from 'mongoose';
import config from 'config';
import logger from './logger';


async function connect(): Promise<void> {
    const dbUri = config.get<string>("dbUri");
    try {
        await mongoose.connect(dbUri);
        logger.info("Successfully connected to DB");
    } catch (error: any) {
        logger.error("Could not connect to db");
        process.exit(1);
    }
}

export default connect
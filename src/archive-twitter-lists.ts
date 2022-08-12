import { insertHasuraData, queryHasuraTwitterFeed } from './helpers/hasuraData';
import { feed } from './helpers/twitterData';
import logger from './util/logger';

(async () => {
  try {
    // get formatted twitter feed
    const twitterFeed = await feed();
    const archivedTwitterFeed = await queryHasuraTwitterFeed();
    const twitterFeedToArchive = twitterFeed
      ? twitterFeed.filter(
          newItem =>
            !archivedTwitterFeed.find(
              exItem => exItem.username === newItem.username
            )
        )
      : [];

    // upload each individually
    if (twitterFeedToArchive.length > 0) {
      await insertHasuraData('feeds_twitter', twitterFeedToArchive);
    } else {
      logger.info(
        '[archive-twitter-lists]: No new Twitter accounts to upload.'
      );
    }
  } catch (error) {
    logger.error(`[archive-twitter-lists] ${error}`);
    process.exit(1);
  }
})();

import { insertHasuraData } from './helpers/hasuraData';
import { latest } from './helpers/latestStarredRepos';
import { CleanRepo } from './models/github';
import logger from './util/logger';

// Upload latest starred repos to Hasura table.
(async () => {
  try {
    // get formatted repos
    const repos: CleanRepo[] | null = await latest();

    // upload each individually
    if (repos && repos.length > 0) {
      await insertHasuraData('development_github', repos);
    } else {
      logger.info('[archive-github-stars]: No new stars to upload.');
    }
  } catch (error) {
    logger.error(`[archive-github-stars] ${error}`);
    process.exit(1);
  }
})();

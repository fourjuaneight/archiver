import chalk from 'chalk';

import { latest } from './helpers/latestStarredRepos';
import { insertHasuraData } from './helpers/hasuraData';

import { CleanRepo } from './models/github';

// Upload latest starred repos to Hasura table.
(async () => {
  try {
    // get formatted repos
    const repos: CleanRepo[] | null = await latest();

    // upload each individually
    if (repos && repos.length > 0) {
      await insertHasuraData('development_github', repos);
    } else {
      console.info(chalk.yellow('[INFO]'), 'No new stars to upload.');
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();

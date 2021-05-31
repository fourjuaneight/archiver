import chalk from 'chalk';

import latest from './helpers/latestStarredRepos';
import uploadStarredRepos from './helpers/uploadStarredRepos';

import { CleanRepo } from './models/github';

// Upload latest starred repos to Airtable base.
(async () => {
  try {
    // get formatted repos
    const repos: CleanRepo[] | null = await latest();

    // upload each individually
    if (repos && repos.length > 0) {
      const starsBackup = repos.map(repo => uploadStarredRepos(repo));

      await Promise.all(starsBackup);
    } else {
      console.info(chalk.yellow('[INFO]'), 'No new stars to upload.');
    }
  } catch (error) {
    console.error(chalk.red('[ERROR]'), error);
    process.exit(1);
  }
})();

# Archiver

![bookmarks](https://github.com/fourjuaneight/archiver/actions/workflows/archive-bookmarks.yml/badge.svg)<br/>
![dead-links](https://github.com/fourjuaneight/archiver/actions/workflows/dead-links.yml/badge.svg)<br/>
![github-stars](https://github.com/fourjuaneight/archiver/actions/workflows/archive-starred-repos.yml/badge.svg)<br/>
![stackexchange](https://github.com/fourjuaneight/archiver/actions/workflows/archive-stackexchange.yml/badge.svg)<br/>
![hasura](https://github.com/fourjuaneight/archiver/actions/workflows/backup-hasura.yml/badge.svg)<br/>

I like hoarding data online. These are a colletion of scripts that ensure this crap doesn't get lost. Here's what they do:
- Upload bookmarked media to B2.
- Archive GitHub starred repos to Hasura.
- Archive bookmarked Stack Exchange questions to Hasura.
- Archive tweets to Hasura.
- Save a JSON backup of all Hasura tables to B2.
- Check for dead links on bookmarks and update status.

All code is self documenting. Aside from the specific names of bases and tables in Hasura, everything is easily portable and ready to fork. You'll just need to provide your own environment variables.

Scripts can be run via `ts-node` or compiled by `tsup` then run via Node.
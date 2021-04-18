# Archiver

![badge](https://action-badges.now.sh/fourjuaneight/archiver)

I like hoarding data online. These are a colletion of scripts that ensure this crap doesn't get lost. Here's what they do:
- Upload bookmarked media to S3 or B2.
- Archive tweets to Airtable.
- Save a JSON backup of all Airtable bases to S3 or B2.

All code is self documenting. Aside from the specific names of bases and tables in Airtable, everything is easily portable and ready to fork. You'll just need to provide your own environment variables.

Scripts can be run via `ts-node` or compiled by `tsup` then run via Node.
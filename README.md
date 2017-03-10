# Congressional Record Web Scraper
This web scraper is an attempt to unearth Congressional floor speeches made by members of Congress from the depths of the Governmemt Publishing Office's Federal Digital System (gpo.gov/fdsys). Additionally, the goal of this project is to extract only pertinent, policy related information. 

## Status
The scraper is functional and retrieves *pertinent* (those that contain policy speeches) for a given day.

## Next Steps
The main problem that still needs to be solved is how to extract the right information from inconsistent big blocks of text. As well, there are many edge cases that need to be considered and dealt with. For example, the text comes in blocks and is not machine readable, which causes a problem when one block of text contains many of policy statements, procedural statements, roll calls, letters, etc. all in one long block of text.

## Technologies in use:
* Node.js
* Express.js
* Request -npm package for making http calls
* Cheerio -npm package that implements a subset of core jQuery for parsing DOMs
* Cron -will be used for running jobs continuously when this is put onto server (this will probably change upon implementation)

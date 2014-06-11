hubot-bitbucket-issue-and-pull
==============================

Simple hubot commands and hooks to interact with BitBucket

Configuration:

```
   HUBOT_BB_USER - User to use API
   HUBOT_BB_PASSWORD - User's password
   HUBOT_BB_OWNER - Owner of repositories
```
  

 Commands:
 
```
   hubot bbissue add <repository-slug> "<issue title>" "<issue content>" <type bug|task|enhancement> - Adds issue to bitBucket
   hubot bbissue list <repository-slug> - Lists new issues in repository 
   hubot bbpull list <repository-slug> - Lists open pull requests
```

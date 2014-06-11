// Description:
//   Allows issue creation and stuff to bitbucket
// Configuration:
//   HUBOT_BB_USER - User to use API
//   HUBOT_BB_PASSWORD - User's password
//   HUBOT_BB_OWNER - Owner of repositories
// Commands:
//   hubot bbissue add <repository-slug> "<issue title>" "<issue content>" <type bug|task|enhancement> - Adds issue to bitBucket
//   hubot bbissue list <repository-slug> - Lists new issues in repository 
//   hubot bbpull list <repository-slug> - Lists open pull requests


var hubot = require("hubot");
var bitbucket = require('bitbucket-api');
var credentials = {username: process.env.HUBOT_BB_USER, password: process.env.HUBOT_BB_PASSWORD};
var client = bitbucket.createClient(credentials);
var owner_ = process.env.HUBOT_BB_OWNER;
var _ = require("lodash");
//https://bitbucket.org/api/1.0/repositories/heimojuh/flowa-blog-jekyll/issues/?status=new
var getBase = function(options) {
    var version = options.version || "1.0";
    return "https://"+encodeURIComponent(credentials.username)+":"+credentials.password+"@bitbucket.org/api/"+version+"/repositories/"+options.owner+"/"+options.repository+"/";
};

var auth = 'Basic ' + encodeURIComponent(credentials.username) + ':' + credentials.password;

module.exports = function(robot) {
    
    //Reports pull requests and pull request state changes to channel
    robot.router.post("/hubot/bitbucketpull/:room", function(req, res) {
        var room = req.params.room;
        var data = req.body.pullrequest_created || req.body.pullrequest_declined || req.body.pullrequest_merged;

        res.writeHead(204, {"Content-Length": 0});
        res.end();
        if (data) {
            var link;
            if (data.id) {
                link = "https://bitbucket.org/"+data.destination.repository.full_name+"/pull-request/"+data.id;
            } else {
                link = "";
            }
            robot.messageRoom(room, data.state + " pull request: " + data.author.username + " : " + data.title + " : "+ link);
        }        


    });
    robot.respond(/bbissue list (.*)/, function(msg) {
        var url = getBase({
            owner: owner_,
            repository: msg.match[1]
        })+"issues/?status=new";
        robot.http(url)
        .get()(function(err, res, body) {
            if (err) {
                msg.send("Error in fetching issues");
            }
            var issues = JSON.parse(body);
            _.each(issues.issues, function(it) {
                msg.send(it.title);
            });

        }); 

    });

    robot.respond(/bbpull list (.*)/, function(msg) {
        var url = getBase({
            owner: owner_,
            repository: msg.match[1],
            version: "2.0"
        })+"pullrequests?state=OPEN";
        robot.http(url)
        .get()(function(err, res, body) {
            if (err) {
                msg.send("Error in fetching pull requests");
            }
            var issues = JSON.parse(body);
            _.each(issues.values, function(it) {
                msg.send(it.title + " : " + it.links.html.href);
            });

        }); 

    });

    robot.respond(/bbissue add (.*) "(.*)" "(.*)" (.*)?/, function(msg) {
        var repoSlug = msg.match[1];

        var message = {
            "title": msg.match[2],
        "content": msg.match[3],
        "kind": msg.match[4] || "Bug",
        "priority": "major"
        };
        var repository = client.getRepository({slug: repoSlug, owner: owner_}, function (err, repo) {
            var issues = repo.issues();
            issues.create(message, function(err, foo) {
                if (err) {
                    msg.send("Could not create issue!!!");
                }
                var id = foo.local_id;
                var url = "https://bitbucket.org/"+owner_+"/"+repoSlug+"/issue/"+id;
                msg.send("created issue "+ id + " : "+url);
            });
        });
    });
};

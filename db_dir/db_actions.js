"use strict";
exports.__esModule = true;
exports.selectAllFromReddit = exports.selectAllFromVideo = exports.pullAllInvRedditIDs = exports.pullAllVidIDs = exports.appendVideoItem = exports.updateRedditPost = exports.appendRedditPost = exports.appendInvalidID = void 0;
var sqlite3 = require("sqlite3");
var TABLE_NAMES;
(function (TABLE_NAMES) {
    TABLE_NAMES["reddit_cont"] = "reddit_cont";
    TABLE_NAMES["video_cont"] = "video_cont";
    TABLE_NAMES["invalid_storys"] = "invalid_storys";
})(TABLE_NAMES || (TABLE_NAMES = {}));
// Our db connector
var db = new sqlite3.Database("".concat(__dirname, "/video_data.db"), function (err) {
    if (err) {
        console.log(err.message);
    }
    console.log('Connected to the SQLite database.');
});
var appendInvalidID = function (arg) {
    var insertSql = "INSERT INTO ".concat(TABLE_NAMES.invalid_storys, " (postID) VALUES (?)");
    db.run(insertSql, [arg.postID], function (err) {
        if (err) {
            console.log(err.message);
        }
        else {
            console.log("".concat(arg.postID, " has been logged to invalid_storys"));
        }
    });
};
exports.appendInvalidID = appendInvalidID;
var appendRedditPost = function (arg) {
    var insertSql = "INSERT INTO ".concat(TABLE_NAMES.reddit_cont, " (postID, postTitle) VALUES (?, ?)");
    db.run(insertSql, [arg.postID, arg.postTitle], function (err) {
        if (err) {
            console.log(err.message);
        }
        else {
            console.log("Reddit data has been appended with rowID ".concat(this.lastID));
        }
    });
};
exports.appendRedditPost = appendRedditPost;
var updateRedditPost = function (arg) {
    var updateSql = "UPDATE ".concat(TABLE_NAMES.reddit_cont, " SET postLen = ? where postID = ?");
    db.run(updateSql, [arg.postLen, arg.postID], function (err) {
        if (err) {
            console.log(err.message);
        }
        else {
            console.log("Post with ID: ".concat(arg.postID, ", time has been added."));
        }
    });
};
exports.updateRedditPost = updateRedditPost;
var appendVideoItem = function (arg) {
    var insertSql = "INSERT INTO ".concat(TABLE_NAMES.video_cont, " (videoID, videoLen, videoName) VALUES (?, ?, ?)");
    db.run(insertSql, [arg.videoID, arg.videoLen, arg.videoName], function (err) {
        if (err) {
            console.log(err.message);
        }
        else {
            console.log("Video data has been appended with rowID ".concat(this.lastID));
        }
    });
};
exports.appendVideoItem = appendVideoItem;
var pullAllVidIDs = function () {
    return new Promise(function (res, rej) {
        db.all("SELECT videoID FROM ".concat(TABLE_NAMES.video_cont), function (err, rows) {
            if (err) {
                return rej(err);
            }
            else {
                var videoIDs = rows.map(function (_a) {
                    var videoID = _a.videoID;
                    return videoID;
                });
                return res(videoIDs);
            }
        });
    });
};
exports.pullAllVidIDs = pullAllVidIDs;
var pullAllInvRedditIDs = function () {
    return new Promise(function (res, rej) {
        db.all("SELECT postID from ".concat(TABLE_NAMES.invalid_storys), function (err, rows) {
            if (err) {
                return rej(err);
            }
            else {
                var postIDs = rows.map(function (_a) {
                    var postID = _a.postID;
                    return postID;
                });
                return res(postIDs);
            }
        });
    });
};
exports.pullAllInvRedditIDs = pullAllInvRedditIDs;
var selectAllFromVideo = function (limit) {
    return new Promise(function (res, rej) {
        db.all("SELECT * FROM video_cont LIMIT ".concat(limit), function (err, row) {
            if (err) {
                return rej(err);
            }
            else {
                return res(row);
            }
        });
    });
};
exports.selectAllFromVideo = selectAllFromVideo;
var selectAllFromReddit = function () {
    return new Promise(function (res, rej) {
        db.all("SELECT * FROM reddit_cont", function (err, row) {
            if (err) {
                return rej(err);
            }
            else {
                return res(row);
            }
        });
    });
};
exports.selectAllFromReddit = selectAllFromReddit;
/* Dev F(n)
(async function() {

    console.log(await selectAllFromVideo(2))
    console.log(await selectAllFromReddit())

}())
*/

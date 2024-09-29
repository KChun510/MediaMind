"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pullAllVidIDs = exports.appendVideoItem = void 0;
var sqlite3 = require("sqlite3");
var TABLE_NAMES;
(function (TABLE_NAMES) {
    TABLE_NAMES["reddit_cont"] = "reddit_cont";
    TABLE_NAMES["video_cont"] = "video_cont";
})(TABLE_NAMES || (TABLE_NAMES = {}));
// Our db connector
var db = new sqlite3.Database("".concat(__dirname, "/video_data.db"), function (err) {
    if (err) {
        console.log(err.message);
    }
    console.log('Connected to the SQLite database.');
});
var appendVideoItem = function (arg) {
    var insertSql = "INSERT INTO ".concat(TABLE_NAMES.video_cont, " (videoID, videoLen, videoName) VALUES (?, ?, ?)");
    db.run(insertSql, [arg.videoID, arg.videoLen, arg.videoName], function (err) {
        if (err) {
            console.log(err.message);
        }
        else {
            console.log("A row has been appended with rowID ".concat(this.lastID));
        }
    });
};
exports.appendVideoItem = appendVideoItem;
var pullAllVidIDs = function () {
    return new Promise(function (res, rej) {
        db.all("SELECT videoID FROM video_cont", function (err, rows) {
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
/*
export const appendRedditItem  = (arg: SQL_SCHEMA) => {
    const insertSql = `INSERT INTO ${TABLE_NAMES.video_cont} (videoID, videoLen, videoName) VALUES (?, ?, ?)`;
    db.run(insertSql, [arg.R_ID, arg.Item, arg.Price, arg.Cals], function(err: Error | null){
    if(err){
        console.log(err.message);
    }
    console.log(`A row has been appended with rowID ${this.lastID}`)
    });
};
*/

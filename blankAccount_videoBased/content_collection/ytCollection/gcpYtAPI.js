var fs = require('fs');
var readline = require('readline');
var { google } = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var { getInvVideoIds } = require('../../db_dir/db_actions.js')

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/youtube-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'youtube-nodejs-quickstart.json';

/**
 * Create an OAuth2 client with the given credentials, and then execute the

 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */

function authorize(credentials) {
    return new Promise((resolve, reject) => {
        const clientSecret = credentials.installed.client_secret;
        const clientId = credentials.installed.client_id;
        const redirectUrl = credentials.installed.redirect_uris[0];
        const oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

        // Check if we have previously stored a token.
        fs.readFile(TOKEN_PATH, (err, token) => {
            if (err) {
                getNewToken(oauth2Client).then(resolve).catch(reject);
            } else {
                oauth2Client.credentials = JSON.parse(token);
                resolve(oauth2Client);
            }
        });
    });
}


/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client) {
    var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Enter the code from that page here: ', function(code) {
        rl.close();
        oauth2Client.getToken(code, function(err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            oauth2Client.credentials = token;
            storeToken(token);
            return oauth2Client
        });
    });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
    try {
        fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
        if (err.code != 'EEXIST') {
            throw err;
        }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) throw err;
        console.log('Token stored to ' + TOKEN_PATH);
    });
}

/**
 * Lists the names and IDs of up to 10 files.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */

// Notes: If your searching by video license, then we need to specify a type of video.

async function getVideosByKeyWords(auth, { valid_vids = 1, keywords = 'dogs', type = 'video', videoDefinition = 'any', videoLicense = "any", results = 10, videoDuration = "medium" }) {
    let service = google.youtube('v3');
    let pageToken = undefined;
    const invalidVidIDs = await getInvVideoIds()
    let validIDs = []
    while (valid_vids > 0) {
        try {
            // Do not delete the await bellow!!
            const res = await service.search.list({
                auth: auth,
                part: 'snippet',
                q: keywords,
                maxResults: results,
                relevanceLanguage: "en",
                videoDefinition,
                videoLicense,
                type,
                videoDuration,
                publishedAfter: "2022-01-01T00:00:00+00:00",
                pageToken
            })
            const video_data = res.data.items
            if (video_data.length > 0) {
                for (const data of video_data) {
                    if (invalidVidIDs.includes(data.id.videoId)) {
                        continue
                    } else if (data.snippet.liveBroadcastContent === 'live') {
                        continue
                    } else {
                        validIDs.push(data.id.videoId)
                        valid_vids--
                        if (valid_vids === 0) {
                            return validIDs
                        }
                    }
                }
                pageToken = res.data.nextPageToken
            } else {
                console.log("Nothing found under that keyword")
                return
            }
        } catch (e) {
            console.error(`Searching by keyword API fail: ${e}`)
            return e
        }
    }
}

const formatTime = (timeString) => {
    const str_len = timeString.length
    timeString = timeString.slice(2, str_len)
    let final = []
    let temp_store = []
    for (let i = 0; i < str_len; i++) {
        const charDecVal = timeString.charCodeAt(i)
        if (charDecVal >= 65 && charDecVal <= 90) {
            final.push(temp_store)
            temp_store = []
            continue
        } else {
            temp_store.push(timeString[i])
        }
    }
    //console.log(timeString)
    if (final.length == 1) {
        return `00:00:${final[0].length > 1 ? `${final[0][0]}${final[0][1]}` : `0${final[0][0]}`}`
    }
    else if (final.length == 2) {
        return `00:${final[0].length > 1 ? `${final[0][0]}${final[0][1]}` : `0${final[0][0]}`}:${final[1].length > 1 ? `${final[1][0]}${final[1][1]}` : `0${final[1][0]}`}`
    } else {
        return `${final[0].length > 1 ? `${final[0][0]}${final[0][1]}` : `0${final[0][0]}`}:${final[1].length > 1 ? `${final[1][0]}${final[1][1]}` : `0${final[1][0]}`}:${final[2].length > 1 ? `${final[2][0]}${final[2][1]}` : `0${final[2][0]}`}`
    }
}

async function getVideoDetails(auth, videoIDs = []) {
    const id_log = videoIDs
    let service = google.youtube('v3')
    const idLen = videoIDs.length
    if (idLen > 50) {
        let tempArr = []
        let chunked = []
        videoIDs.forEach((id, index) => {
            if (tempArr.length < 50) {
                tempArr.push(id)
            } else if (tempArr.length > 50 | index === idLen - 1) {
                chunked.push(tempArr)
                tempArr = []
            }
        })
        videoIDs = chunked
    } else {
        videoIDs = [[videoIDs]]
    }
    try {
        let id_index = 0
        let return_objArr = []
        for (const idSet of videoIDs) {
            const res = await service.videos.list({
                auth: auth,
                part: 'snippet,contentDetails',
                //part: 'snippet,contentDetails,statistics',
                id: idSet
            })
            const videoData = res.data.items
            for (const video of videoData) {
                const formattedTime = formatTime(video.contentDetails.duration)
                return_objArr.push({ videoID: id_log[id_index], videoLen: formattedTime, videoName: video.snippet.title })
                id_index++
            }
        }
        return return_objArr
    } catch (e) {
        console.error(`Getting video details failed error: ${e}`)
        return e
    }
}


module.exports = { authorize, getVideosByKeyWords, getVideoDetails }

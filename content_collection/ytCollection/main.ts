import { authorize, getVideosByKeyWords, getVideoDetails } from './gcpYtAPI'
import * as fs from 'fs'
import { appendVideoItem } from '../../db_dir/db_actions'

(function() {
    fs.readFile('client_secret.json', 'utf8', async function processClientSecrets(err, content) {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }
        // Authorize a client with the loaded credentials, then call the YouTube API.
        const oAuthToken = await authorize(JSON.parse(content))
        //getVideosByKeyWords(oAuthToken, { keywords: "funny dog memes", videoDefinition = 'standard' ,videoLicense: "creativeCommon", results: 5, pages: 1 })
        const vidIdRes = await getVideosByKeyWords(oAuthToken, { valid_vids: 1, keywords: "funny dog memes", videoLicense: "youtube", results: 5 })
        const videoDetails = await getVideoDetails(oAuthToken, vidIdRes)
        videoDetails?.map(({ videoID, videoLen, videoName }) => appendVideoItem({ videoID, videoLen, videoName }))
    });
})()


import { authorize, getVideosByKeyWords } from "./gcpYtAPI"
import * as fs from 'fs'


(function() {
    fs.readFile('client_secret.json', 'utf8', async function processClientSecrets(err, content) {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }
        // Authorize a client with the loaded credentials, then call the YouTube API.
        const oAuthToken = await authorize(JSON.parse(content))
        // Shiza stock footage call
        getVideosByKeyWords(oAuthToken, { keywords: "funny dog memes", videoLicense: "creativeCommon", results: 5, pages: 4 })
        // Real video footage
        getVideosByKeyWords(oAuthToken, { keywords: "funny dog memes", videoLicense: "youtube", results: 5, pages: 4 })



    });
})()


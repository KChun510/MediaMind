import { authorize, getVideosByKeyWords, getVideoDetails } from './gcpYtAPI'
import * as fs from 'fs'
import { appendVideoItem } from '../../db_dir/db_actions'
import { execSync } from 'child_process';





(function() {
    const outPutPath = "../../editing/youTube_cont"
    fs.readFile('client_secret.json', 'utf8', async function processClientSecrets(err, content) {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }
        // Authorize a client with the loaded credentials, then call the YouTube API.
        const oAuthToken = await authorize(JSON.parse(content))

        //getVideosByKeyWords(oAuthToken, { keywords: "funny dog memes", videoDefinition = 'standard' ,videoLicense: "creativeCommon", results: 5, pages: 1 })

        //        const vidIdRes = await getVideosByKeyWords(oAuthToken, { valid_vids: 1, keywords: "Gameplay Playthrough", videoLicense: "youtube", results: 5 })
        const vidIdRes = await getVideosByKeyWords(oAuthToken, { valid_vids: 1, keywords: "Gameplay Playthrough", videoLicense: "creativeCommon", results: 5 })

        const videoDetails = await getVideoDetails(oAuthToken, vidIdRes)
        for (const video of videoDetails ? videoDetails : []) {
            const videoCommand = `yt-dlp --sub-lang "en.*" --embed-subs --no-overwrites https://www.youtube.com/watch?v=${video.videoID} -o "${outPutPath}/videos/${video.videoID}.%(ext)s"`
            const subtitleCommand = `ffmpeg -i ${outPutPath}/videos/${video.videoID}.* -map 0:s:0? ${outPutPath}/srt/${video.videoID}.srt`

            appendVideoItem({ videoID: video.videoID, videoLen: video.videoLen, videoName: video.videoName })
            console.log(execSync(videoCommand).toString())
            //console.log(execSync(subtitleCommand).toString())

        }

    });
})()


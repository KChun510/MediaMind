import { authorize, getVideosByKeyWords, getVideoDetails } from './gcpYtAPI'
import { writeMetaData, writeMetaData_VidPlusSub, writeMetaData_twoVids_oneMain, getProjectRoot } from '../../sysCallAPI'
import { appendMainVideoItem, appendVideoItem, appendInvVidID, VIDEO_SQL_SCHEMA } from '../../db_dir/db_actions'
import { OpenAI } from "openai"
import * as util from 'util'
import * as fs from 'fs'
import path from 'path'

const rootCredPath = path.join(getProjectRoot(__dirname), '/cred_dir/')
const process1 = { env: require('dotenv').config({ path: require('find-config')('.env') }).parsed || process.env };
const process2 = { env: require('dotenv').config({ path: path.join(rootCredPath, '.env') }) }
const openai = new OpenAI({ apiKey: process2.env.OPENAI_API_KEY })
const outPutDir = `${process1.env.CONT_DIR}`
const writeFile = util.promisify(fs.writeFile)
const readFile = util.promisify(fs.readFile)

function videoTime(videoData: VIDEO_SQL_SCHEMA[]): number {
    let total_sec = 0
    for (const obj of videoData) {
        const [hours, minutes, seconds] = obj.videoLen.split(':').map(Number)
        total_sec += hours * 3600 + minutes * 60 + seconds
    }
    return total_sec
}

(async function() {
    // Max is 30 mins
    const maxVideoTime = 1800
    const minVideoTime = 240
    let totalVideoTime = 0
    const outPutPath = `${process1.env.CONT_DIR}/youTube_cont`
    fs.readFile(rootCredPath + 'client_secret.json', 'utf8', async function process1ClientSecrets(err, content) {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }
        // Authorize a client with the loaded credentials, then call the YouTube API.
        const oAuthToken = await authorize(JSON.parse(content))
        while (totalVideoTime <= maxVideoTime) {
            try {
                const vidIdRes = await getVideosByKeyWords(oAuthToken, { valid_vids: 10, keywords: "gameplay hd no commentary", videoLicense: "any", results: 50, videoDuration: "long" })
                const videoDetails = await getVideoDetails(oAuthToken, vidIdRes)
                for (const video of videoDetails ?? []) {
                    const videoCommand = `yt-dlp --sub-lang "en.*" --embed-subs --no-overwrites https://www.youtube.com/watch?v=${video.videoID} -o "${outPutPath}/video_dir/${video.videoID}"`
                    const subtitleCommand = `ffmpeg -i ${outPutPath}/video_dir/${video.videoID}.* -map 0:s:0? ${outPutPath}/srt/${video.videoID}`
                    const currVidTime = videoTime([video])
                    if (totalVideoTime >= maxVideoTime) {
                        return
                    }
                    else if (currVidTime >= minVideoTime && currVidTime <= maxVideoTime) {
                        appendVideoItem({ videoID: video.videoID, videoLen: video.videoLen, videoName: video.videoName })
                        appendInvVidID(video.videoID)
                        console.log(`Downloaded videoID: ${video.videoID}, Len: ${video.videoLen}`)
                        console.log(execSync(videoCommand).toString())
                        totalVideoTime += currVidTime
                    } else {
                        appendInvVidID(video.videoID)
                    }
                }
            } catch (e) {
                console.log(`\n Quitting download exec: ${e}  \n`)
                return
            }
        }
    });
})()


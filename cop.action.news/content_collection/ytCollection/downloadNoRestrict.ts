import { authorize, getVideosByKeyWords, getVideoDetails } from './gcpYtAPI'
import { writeMetaData, writeMetaData_alt } from '../../sysCallAPI'
import * as fs from 'fs'
import { appendVideoItem, appendInvVidID, VIDEO_SQL_SCHEMA } from '../../db_dir/db_actions'
import { execSync } from 'child_process'
import { OpenAI } from "openai"
import * as util from 'util'
require('dotenv').config({ path: require('find-config')('.env') })

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const outPutDir = `${process.env.CONT_DIR}`
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

function formatTime(time: { secs: number, miliSec: string }): string {
    const miliSec = time.miliSec ? time.miliSec.slice(0, 3) : "000"
    const hoursReturn = Math.floor(time.secs / 3600);
    const minutesReturn = Math.floor((time.secs % 3600) / 60);
    const secsReturn = time.secs % 60;
    const returnStamp: string = [
        String(hoursReturn).padStart(2, '0'),
        String(minutesReturn).padStart(2, '0'),
        String(secsReturn).padStart(2, '0'),
    ].join(':');

    return returnStamp + `,${miliSec}`
}

async function speech_to_text(valid_file: string) {
    console.log(execSync(`ffmpeg -i ${outPutDir}/youTube_cont/videos/${valid_file}.mp4 -vn -acodec libmp3lame -ab 192k -ar 44100 ${outPutDir}/youTube_cont/videos/${valid_file}.mp3 `, { encoding: 'utf-8' }).toString())

    const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(`${outPutDir}/youTube_cont/videos/${valid_file}.mp3`),
        model: "whisper-1",
        response_format: "verbose_json",
        timestamp_granularities: ["word"]
    });
    let srt_string: string = ""
    for (let i = 0; i < transcription.words.length; i++) {
        const startTime = transcription.words[i].start.toString().split(".")
        const endTime = transcription.words[i].end.toString().split(".")
        const word = transcription.words[i].word.toUpperCase()
        srt_string += `${i + 1}\n${formatTime({ secs: startTime[0], miliSec: startTime[1] })} --> ${formatTime({ secs: endTime[0], miliSec: endTime[1] })}\n${word}\n\n`
    }
    await writeFile(`${outPutDir}/youTube_cont/srt/${valid_file}.srt`, srt_string, 'utf8');
    console.log(`Transcription made, file: ${valid_file}`);
}

async function create_metaData(input: { valid_file: string }) {
    const srtContent = await readFile(`${outPutDir}/youTube_cont/srt/${input.valid_file}.srt`, 'utf8');

    const meta_data = await openai.chat.completions.create({
        messages: [{ role: "system", content: "You are tasked with analyzing text, creating a one sentance description in a entertaining and genuine tone of the text and a list of (4-6) popular hashtags about the text. You output the single sentance, then seperated by a new line you list the hashtags together seperated by one space between each one." },
        { role: "user", content: `Here is the text analyze: ${srtContent}` }],
        model: "gpt-4o-mini",
    });
    const metaContent = meta_data.choices[0].message.content
    writeMetaData_alt(input.valid_file, metaContent ?? "")
}

(async function() {
    // Max is 30 mins
    const maxVideoTime = 1800
    const minVideoTime = 240
    let totalVideoTime = 0
    const outPutPath = `${process.env.CONT_DIR}/youTube_cont`
    fs.readFile('client_secret.json', 'utf8', async function processClientSecrets(err, content) {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }
        // Authorize a client with the loaded credentials, then call the YouTube API.
        const oAuthToken = await authorize(JSON.parse(content))
        while (totalVideoTime <= maxVideoTime) {
            try {
                const vidIdRes = await getVideosByKeyWords(oAuthToken, { valid_vids: 10, keywords: "police footage", videoLicense: "any", results: 10, videoDuration: "long" })
                const videoDetails = await getVideoDetails(oAuthToken, vidIdRes)
                for (const video of videoDetails ?? []) {
                    const videoCommand = `yt-dlp --write-sub --write-auto-sub --sub-lang "en.*" --embed-subs --force-overwrites https://www.youtube.com/watch?v=${video.videoID} -o "${outPutPath}/videos/${video.videoID}.%(ext)s"`

                    const subtitleCommand = `ffmpeg -y -i "${outPutPath}/videos/${video.videoID}.mp4" -map 0:s:0? "${outPutPath}/srt/${video.videoID}.srt"`

                    const currVidTime = videoTime([video])
                    if (totalVideoTime >= maxVideoTime) {
                        return
                    }
                    else if (currVidTime >= minVideoTime && currVidTime <= maxVideoTime) {
                        appendInvVidID(video.videoID)
                        console.log(`Downloaded videoID: ${video.videoID}, Len: ${video.videoLen}`)
                        console.log(execSync(videoCommand, { encoding: 'utf-8' }).toString())
                        console.log(execSync('./convert_to_mp4.sh', { encoding: 'utf-8' }).toString())
                        console.log(execSync(subtitleCommand, { encoding: 'utf-8' }).toString())
                        await create_metaData({ valid_file: video.videoID })
                        appendVideoItem({ videoID: video.videoID, videoLen: video.videoLen, videoName: video.videoName })
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


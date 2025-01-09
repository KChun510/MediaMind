import { getClips } from './twitchAPI'
import { writeMetaData, writeMetaData_VidPlusSub, writeMetaData_twoVids_oneMain } from '../../sysCallAPI'
import * as fs from 'fs'
import { appendMainVideoItem, appendInvVidID, VIDEO_SQL_SCHEMA } from '../../db_dir/db_actions'
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
	console.log(execSync(`ffmpeg -i ${outPutDir}/youTube_cont/video_dir/${valid_file}.mp4 -vn -acodec libmp3lame -ab 192k -ar 44100 ${outPutDir}/youTube_cont/video_dir/${valid_file}.mp3 `, { encoding: 'utf-8' }).toString())

	const transcription = await openai.audio.transcriptions.create({
		file: fs.createReadStream(`${outPutDir}/youTube_cont/video_dir/${valid_file}.mp3`),
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
	writeMetaData_twoVids_oneMain(input.valid_file, metaContent ?? "")
}

async function create_metaData_fromTitle(input: { videoID: string, videoTitle: string }) {

	const meta_data = await openai.chat.completions.create({
		messages: [{ role: "system", content: "You are tasked with analyzing a video title, creating a one sentance description in a entertaining and genuine tone of the text and a list of (4-6) popular hashtags about the text. You output the single sentance, then seperated by a new line you list the hashtags together seperated by one space between each one." },
		{ role: "user", content: `Here is the text analyze: ${input.videoTitle}` }],
		model: "gpt-4o-mini",
	});
	const metaContent = meta_data.choices[0].message.content
	writeMetaData_VidPlusSub(input.videoID, metaContent ?? "")
}

function formatTimeFromSeconds(seconds: number) {
	const second_str = String(seconds)
	const splitSec = second_str.split(".")
	const sec = Number(splitSec[0])
	if (sec >= 60) {
		return "00:01:00"
	} else {
		return `00:00:${sec}`
	}
}

type twitchClip = {
	id: string,
	title: string,
	duration: number
}

function getClipDetails(clipRes: twitchClip[]) {
	let clipLog: VIDEO_SQL_SCHEMA[] = []

	for (const clipObj of clipRes) {
		const clipID = clipObj.id
		const clipName = clipObj.title
		const length = formatTimeFromSeconds(clipObj.duration)
		clipLog.push({ videoID: clipID, videoLen: length, videoName: clipName })
	}

	return clipLog
}

(async function() {
	const maxVideoTime = 600
	const minVideoTime = 5
	const outPutPath = `${process.env.CONT_DIR}/youTube_cont`
	try {
		const vidIdRes = await getClips({ validClips: 1, broadID: "641972806" })
		const videoDetails = getClipDetails(vidIdRes)

		for (const video of videoDetails ?? []) {
			const videoCommand = `yt-dlp https://clips.twitch.tv/${video.videoID} -o "${outPutPath}/video_dir/${video.videoID}.%(ext)s"`
			const currVidTime = videoTime([video])
			if (currVidTime >= minVideoTime && currVidTime <= maxVideoTime) {
				appendInvVidID(video.videoID)
				console.log(`Downloaded videoID: ${video.videoID}, Len: ${video.videoLen}`)
				console.log(execSync(videoCommand, { encoding: 'utf-8' }).toString())
				await create_metaData_fromTitle({ videoID: video.videoID, videoTitle: video.videoName })
				appendMainVideoItem({ videoID: video.videoID, videoLen: video.videoLen, videoName: video.videoName })
			} else {
				appendInvVidID(video.videoID)
			}
		}
	} catch (e) {
		console.log(`\n Quitting download exec: ${e}  \n`)
		return
	}
})()



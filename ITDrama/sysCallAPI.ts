import { execSync } from 'child_process'
import { delRedditData, delVidData, getVideoData } from './db_dir/db_actions'
import { OpenAI } from "openai"
import path from 'path'
import * as util from 'util'
import fs from 'fs';
const readFile = util.promisify(fs.readFile)

const process1 = { env: require('dotenv').config({ path: require('find-config')('.env') }).parsed || process.env };
const process2 = { env: require('dotenv').config({ path: path.join(getProjectRoot(__dirname), '/cred_dir', '.env') }) }
const openai = new OpenAI({ apiKey: process2.env.OPENAI_API_KEY })
const CONT_DIR = process1.env.CONT_DIR;


const CONT_DIRS = {
        overlay_png: `${CONT_DIR}/overlay_png`,
        Reddit_audio: `${CONT_DIR}/reddit_cont/audio_dir`,
        Reddit_sub: `${CONT_DIR}/reddit_cont/sub_dir`,
        Reddit_text: `../content_collection/redditCollection/reddit_content_format/input_content/text_storys`,
        ytVideos: `${CONT_DIR}/youTube_cont/video_dir`,
        ytSub: `${CONT_DIR}/youTube_cont/sub_dir`,
        prodVidAndStory: `${CONT_DIR}/prod_vids/single_vid_plus_reddit/`,
        prodVidPlusSub: `${CONT_DIR}/prod_vids/video_plus_sub/`,
        prodTwoVidOneMain: `${CONT_DIR}/prod_vids/twoVids_oneMain/`,
}

export function writeMetaData(rPostID: string, textCont: string) {
        fs.writeFile(`${CONT_DIRS.prodVidAndStory}${rPostID}.txt`, textCont, (err) => {
                if (err) {
                        console.error('Error writing file:', err)
                } else {
                        console.log(`MetaData created for: ${rPostID}`)
                }
        })
}

export function create_story_over_single_video(rPostId: string, ytVideoId: string) {
        const cmd_story_over_single_video = `ffmpeg -y -i ${CONT_DIRS.ytVideos}/${ytVideoId}.mp4 -i ${CONT_DIRS.Reddit_audio}/${rPostId}.txt.mp3 -i ${CONT_DIRS.Reddit_sub}/${rPostId}.ass -c:v libx264 -c:a aac -b:a 192k -vf "scale=-1:1920:force_original_aspect_ratio=decrease,crop=1080:1920,subtitles=${CONT_DIRS.Reddit_sub}/${rPostId}.ass" -map 0:v -map 1:a -shortest -y ${CONT_DIRS.prodVidAndStory}${rPostId}.mp4`;

        execSync(cmd_story_over_single_video)
}

export function create_twoVids_OneStory(rPostId: string, ytVideoId1: string, ytVideoId2: string) {
        const cmd_twoVids_OneStory = `ffmpeg -y -i "${CONT_DIRS.ytVideos}/${ytVideoId1}.mp4" -i "${CONT_DIRS.ytVideos}/${ytVideoId2}.mp4" -i "${CONT_DIRS.Reddit_audio}/${rPostId}.txt.mp3" -filter_complex "[0:v]scale=1080:960:force_original_aspect_ratio=increase,crop=1080:960[top];[1:v]scale=1080:960:force_original_aspect_ratio=increase,crop=1080:960[bottom];[top][bottom]vstack[stacked];[stacked]split=2[main][blur];[blur]crop=1080:30:0:950,boxblur=luma_radius=10:luma_power=2:chroma_radius=7:chroma_power=2[feathered];[main][feathered]overlay=0:950:shortest=1[blended];[blended]ass=${CONT_DIRS.Reddit_sub}/${rPostId}.ass[stacked_with_subs]" -map "[stacked_with_subs]" -map 2:a -c:v libx264 -c:a aac -b:a 192k -preset fast -crf 23 -shortest "${CONT_DIRS.prodVidAndStory}/${rPostId}.mp4"`

        execSync(cmd_twoVids_OneStory)
}

export function cut_video(startTime: string, videoID: string) {
        const inputFile = `${CONT_DIRS.ytVideos}/${videoID}.mp4`;
        const outputFile = `${CONT_DIRS.ytVideos}/${videoID}_cut.mp4`; // Use a different output filename

        const cutCmd = `ffmpeg -y -ss ${startTime} -i ${inputFile} -c copy -avoid_negative_ts make_zero ${outputFile}`;

        try {
                execSync(cutCmd)
                // Replace the original file with the cut file
                fs.renameSync(outputFile, inputFile);
                console.log(`Successfully replaced ${inputFile} with ${outputFile}`);
        } catch (error) {
                console.error("Error cutting video:", error);
        }
}

export function delete_video(ytVideoId: string) {
        const cmd_string = `rm ${CONT_DIRS.ytVideos}/${ytVideoId}.mp4`
        execSync(cmd_string)
}

export function delete_reddit_cont(postID: string) {
        // Del Srt file
        const cmd_string1 = `rm ${CONT_DIRS.Reddit_sub}/${postID}*`
        // Del audio file
        const cmd_string2 = `rm ${CONT_DIRS.Reddit_audio}/${postID}*`
        // Del OG text file
        const cmd_string3 = `rm ${CONT_DIRS.Reddit_text}/${postID}*`

        console.log(`Reddit CleanUp init: ${postID}`)
        execSync(`${cmd_string1} && ${cmd_string2} && ${cmd_string3}`)
}

export function segment_clip(redditId: string, seconds: number) {
        if (seconds === 0) {
                return
        }
        const secs = seconds.toString()

        const seg_string = `ffmpeg -i ${CONT_DIRS.prodVidAndStory}/${redditId}.mp4 -f segment -segment_time ${secs} -c:v libx264 -c:a aac -map 0 -reset_timestamps 1 ${CONT_DIRS.prodVidAndStory}/${redditId}%03d.mp4`;
        const del_string = `rm ${CONT_DIRS.prodVidAndStory}/${redditId}.mp4`
        execSync(`${seg_string} && ${del_string}`)
        console.log(`Video of ID: ${redditId}, has been segmented.`)
}

function getRandomInt(min: number, max: number) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function tts_coqui(valid_file: string, randomized: boolean, inputSpeaker: string | null = null) {
        const avail_speakers = ['Claribel Dervla', 'Daisy Studious', 'Gracie Wise', 'Tammie Ema', 'Alison Dietlinde', 'Ana Florence', 'Annmarie Nele', 'Asya Anara', 'Brenda Stern', 'Gitta Nikolina', 'Henriette Usha', 'Sofia Hellen', 'Tammy Grit', 'Tanja Adelina', 'Vjollca Johnnie', 'Andrew Chipper', 'Badr Odhiambo', 'Dionisio Schuyler', 'Royston Min', 'Viktor Eka', 'Abrahan Mack', 'Adde Michal', 'Baldur Sanjin', 'Craig Gutsy', 'Damien Black', 'Ilkin Urbano', 'Kazuhiko Atallah', 'Ludvig Milivoj', 'Suad Qasim', 'Torcull Diarmuid', 'Viktor Menelaos', 'Zacharie Aimilios', 'Nova Hogarth', 'Maja Ruoho', 'Uta Obando', 'Lidiya Szekeres', 'Szofi Granger', 'Camilla Holmström', 'Lilya Stainthorpe', 'Zofija Kendrick', 'Narelle Moon', 'Barbora MacLean', 'Alexandra Hisakawa', 'Alma María', 'Rosemary Okafor', 'Ige Behringer', 'Filip Traverse', 'Damjan Chapman', 'Wulf Carlevaro', 'Aaron Dreschner', 'Kumar Dahl', 'Eugenio Mataracı', 'Ferran Simen', 'Xavier Hayasaka', 'Marcos Rudaski']
        const outPutDir = CONT_DIRS.Reddit_audio
        const fileContent = await readFile(`./input_content/text_storys/${valid_file}`, 'utf8');
        let tts_string = ""

        if (randomized) {
                const chosenSpeaker = avail_speakers[getRandomInt(0, avail_speakers.length - 1)]
                console.error(`Speaker Chosen: ${chosenSpeaker}`)
                tts_string = `tts --text "${fileContent}" --model_name "tts_models/multilingual/multi-dataset/xtts_v2"  --out_path ${outPutDir}/${valid_file}.mp3 --speaker_idx '${chosenSpeaker}' --language_idx="en"`
        } else if (inputSpeaker) {
                console.error(`Speaker Chosen: ${inputSpeaker}`)
                tts_string = `tts --text "${fileContent}" --model_name "tts_models/multilingual/multi-dataset/xtts_v2"  --out_path ${outPutDir}/${valid_file}.mp3 --speaker_idx ${inputSpeaker} --language_idx="en"`
        }
        console.log(`COQUI_AI TTS: Started ${valid_file}`)
        try {
                const result = execSync(tts_string, { encoding: 'utf8' })
                console.log("XTTS worked: ", result)
        } catch (error) {
                console.error('XTTS failed!')
                console.error('Exit code:', error.status)
                console.error('Stdout:', error.stdout?.toString())
                console.error('Stderr:', error.stderr?.toString())
                delRedditData((valid_file.split("."))[0])
                process.exit(1)
        }
        console.log(`COQUI_AI: Audio content written to file: ${valid_file}.mp3`);
}

export async function speed_up_audio(input: { valid_file: string, rate: string }) {
        const temp_name = "temp_file"
        const cmd_file_rename = `mv ${CONT_DIRS.Reddit_audio}/${input.valid_file}.mp3 ${CONT_DIRS.Reddit_audio}/${temp_name}.mp3`
        const cmd_string = `ffmpeg -y -i ${CONT_DIRS.Reddit_audio}/${temp_name}.mp3 -filter:a "atempo=${input.rate}" -vn -b:a 192k ${CONT_DIRS.Reddit_audio}/${input.valid_file}.mp3`
        try {
                execSync(`${cmd_file_rename} && ${cmd_string}`, { encoding: 'utf-8' })
        } catch (e) {
                console.error("Error in speeding up the mp3")
        }
}

export async function downloadYTVideo() {
        // If you want to change the type of video being downloaded, go to TS script direclty
        const cmd_string1 = `cd ../content_collection/ytCollection`
        const cmd_string2 = "sh ./downloadNoRestrict.sh"
        console.log("Downloading extra video")
        console.log(execSync(`pwd`, { encoding: 'utf-8' }).toString())
        try {
                execSync(`${cmd_string1} && ${cmd_string2}`)
        } catch (e) {
                console.log(`YTDownload failed: `, e)
        }
}


export async function create_png_overlay(input: { ytVideoID: string }) {
        const videoObj = await getVideoData({ videoID: input.ytVideoID })

        const overlay_text = (await openai.chat.completions.create({
                messages: [{ role: "system", content: "You will be given a video a video title. With this video title I want you to create a single sentance/ new headline. IMPORTANT: Max character len of 50, including spaces " },
                { role: "user", content: `The video title: ${videoObj.videoName}` }],
                model: "gpt-4o-mini"
        })).choices[0].message.content

        const broken_text = overlay_text?.replace(/"/g, "").split(" ");

        let line_len = 0
        let formatted_text: string[] = []
        let curr_line: string = ""
        broken_text?.forEach(word => {
                if (line_len + word.length >= 42) {
                        formatted_text.push(`${curr_line.slice(0, -1)}`)
                        curr_line = "" + word + " "
                        line_len = 0
                } else {
                        curr_line += `${word} `
                        line_len += curr_line.length
                }
        })
        formatted_text.push(`${curr_line.slice(0, -1)}`)

        const quotedArgs = [input.ytVideoID, ...formatted_text.map(text => `"${text}"`)]

        const command = `../custom_shellScripts/headline_png.sh ${quotedArgs.join(' ')}`

        console.log(execSync(command, { encoding: 'utf-8' }).toString())
}

export async function create_png_video(ytVideoId: string) {
        await create_png_overlay({ ytVideoID: ytVideoId })
        // Note: At 2.2 scaling we have a max character length of 39 per line.
        //
        const png_scaling_factor = "2.2"
        // (1-0), smaller value = higher on screen, larger value = lower
        const y_placment = ".1"

        const cmd_with_png_overlay = `ffmpeg -y -i ${CONT_DIRS.ytVideos}/${ytVideoId}.mp4 -i ${CONT_DIRS.ytVideos}/${ytVideoId}.mp4 -i ${CONT_DIRS.overlay_png}/${ytVideoId}.png -filter_complex "[0:v]scale=1080:-1:force_original_aspect_ratio=decrease[padded];[1:v]format=rgb24,scale=1080:1920,boxblur=20:10[blurred];[blurred][padded]overlay=(W-w)/2:(H-h)/2[backgrounded];[2:v]scale=iw*${png_scaling_factor}:ih*${png_scaling_factor}[scaled_png];[backgrounded][scaled_png]overlay=(W-w)/2:H*${y_placment}[overlayed]" -map "[overlayed]" -map 0:a -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k ${CONT_DIRS.prodVidPlusSub}/${ytVideoId}.mp4`;

        execSync(cmd_with_png_overlay, { encoding: 'utf-8', maxBuffer: 1024 * 1024 * 10 })
}

export function checkFiles(input: { fileNames: string[] }) {
        for (const name of input.fileNames) {
                if (fs.existsSync(`${CONT_DIRS.ytVideos}/${name}`)) {
                } else {
                        console.log(`File: ${name} does not exist, Deleting... `);
                        delVidData(name)
                }
        }
}

export function getProjectRoot(currentFilePath: string) {
        let dir = path.resolve(currentFilePath)

        while (dir !== path.parse(dir).root) {
                if (fs.existsSync(path.join(dir, 'package.json')) || fs.existsSync(path.join(dir, '.git'))) {
                        return dir;
                }
                dir = path.dirname(dir)
        }

        return dir
}

// Dev FN
try {
} catch (e) {
        console.error(e)
}

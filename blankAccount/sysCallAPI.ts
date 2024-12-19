import { execSync } from 'child_process'
import { delRedditData, getVideoData } from './db_dir/db_actions'
import { OpenAI } from "openai"
import * as util from 'util'
import fs from 'fs';
require('dotenv').config({ path: require('find-config')('.env') })

const readFile = util.promisify(fs.readFile)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const CONT_DIR = process.env.CONT_DIR

const CONT_DIRS = {
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
        const cmd_story_over_single_video = `ffmpeg -i ${CONT_DIRS.ytVideos}/${ytVideoId}.mp4 -i ${CONT_DIRS.Reddit_audio}/${rPostId}.txt.mp3 -i ${CONT_DIRS.Reddit_sub}/${rPostId}.txt.srt -c:v libx264 -c:a aac -b:a 192k -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(1080-iw)/2:(1920-ih)/2,subtitles=${CONT_DIRS.Reddit_sub}/${rPostId}.txt.srt:force_style='FontName=Arial,Bold=1,FontSize=12,PrimaryColour=&H00FFFFFF&,SecondaryColour=&H000000&,Outline=2,BorderStyle=1,Alignment=2,MarginV=50'" -map 0:v -map 1:a -shortest -y ${CONT_DIRS.prodVidAndStory}${rPostId}.mp4`;

        const cmd_story_over_single_video2 = `ffmpeg -i ${CONT_DIRS.ytVideos}/${ytVideoId}.mp4 -i ${CONT_DIRS.Reddit_audio}/${rPostId}.txt.mp3 -i ${CONT_DIRS.Reddit_sub}/${rPostId}.txt.srt -c:v libx264 -c:a aac -b:a 192k -vf "scale=-1:1920:force_original_aspect_ratio=decrease,crop=1080:1920,subtitles=${CONT_DIRS.Reddit_sub}/${rPostId}.txt.srt:force_style='FontName=Arial,Bold=1,FontSize=12,PrimaryColour=&H00FFFFFF&,SecondaryColour=&H000000&,Outline=1,BorderStyle=1,Alignment=10'" -map 0:v -map 1:a -shortest -y ${CONT_DIRS.prodVidAndStory}${rPostId}.mp4`;
        console.log(execSync(cmd_story_over_single_video2).toString())
}

export function create_twoVids_OneStory(rPostId: string, ytVideoId1: string, ytVideoId2: string) {
        const cmd_twoVids_OneStory = `ffmpeg -i ${CONT_DIRS.ytVideos}/${ytVideoId1}.mp4 -i ${CONT_DIRS.ytVideos}/${ytVideoId2}.mp4 -i ${CONT_DIRS.Reddit_audio}/${rPostId}.txt.mp3 -i ${CONT_DIRS.Reddit_sub}/${rPostId}.txt.srt \
        -filter_complex "[0:v]scale=1080:960, pad=1080:960:(ow-iw)/2:(oh-ih)/2[subtop]; \
        [1:v]scale=1080:960, pad=1080:960:(ow-iw)/2:(oh-ih)/2[subbottom]; \
        [subtop][subbottom]vstack[stacked]; \
        [stacked]subtitles=${CONT_DIRS.Reddit_sub}/${rPostId}.txt.srt:force_style='FontName=Arial,Bold=1,FontSize=12,PrimaryColour=&H00FFFFFF&,SecondaryColour=&H000000&,Outline=1,BorderStyle=1,Alignment=10'[out]" \
        -map "[out]" -map 2:a -c:v libx264 -c:a aac -b:a 192k -shortest ${CONT_DIRS.prodVidAndStory}${rPostId}.mp4`;

        const cmd_twoVids_OneStory2 = `ffmpeg -y -i ${CONT_DIRS.ytVideos}/${ytVideoId1}.mp4 -i ${CONT_DIRS.ytVideos}/${ytVideoId2}.mp4 -i ${CONT_DIRS.Reddit_audio}/${rPostId}.txt.mp3 -i ${CONT_DIRS.Reddit_sub}/${rPostId}.txt.srt \
        -filter_complex "[0:v]scale=iw*0.9:-1,crop=1080:960:(in_w-1080)/2:(in_h-960)/2[subtop]; \
        [1:v]scale=iw*0.9:-1,crop=1080:960:(in_w-1080)/2:(in_h-960)/2[subbottom]; \
        [subtop][subbottom]vstack[stacked]; \
        [stacked]subtitles=${CONT_DIRS.Reddit_sub}/${rPostId}.txt.srt:force_style='FontName=Arial,Bold=1,FontSize=12,PrimaryColour=&H00FFFFFF&,SecondaryColour=&H000000&,Outline=1,BorderStyle=1,Alignment=10'[out]" \
        -map "[out]" -map 2:a -c:v libx264 -c:a aac -b:a 192k -shortest ${CONT_DIRS.prodVidAndStory}${rPostId}.mp4`

        console.log(execSync(cmd_twoVids_OneStory2, { encoding: 'utf-8' }).toString())
}

export function cut_video(startTime: string, videoID: string) {
        const inputFile = `${CONT_DIRS.ytVideos}/${videoID}.mp4`;
        const outputFile = `${CONT_DIRS.ytVideos}/${videoID}_cut.mp4`; // Use a different output filename

        const cutCmd = `ffmpeg -y -ss ${startTime} -i ${inputFile} -c copy -avoid_negative_ts make_zero ${outputFile}`;

        try {
                console.log(execSync(cutCmd).toString());
                // Replace the original file with the cut file
                fs.renameSync(outputFile, inputFile);
                console.log(`Successfully replaced ${inputFile} with ${outputFile}`);
        } catch (error) {
                console.error("Error cutting video:", error);
        }
}

export function delete_video(ytVideoId: string) {
        const cmd_string = `rm ${CONT_DIRS.ytVideos}/${ytVideoId}.mp4`
        console.log(execSync(cmd_string).toString())
}

export function delete_reddit_cont(postID: string) {
        // Del Srt file
        const cmd_string1 = `rm ${CONT_DIRS.Reddit_sub}/${postID}*`
        // Del audio file
        const cmd_string2 = `rm ${CONT_DIRS.Reddit_audio}/${postID}*`
        // Del OG text file
        const cmd_string3 = `rm ${CONT_DIRS.Reddit_text}/${postID}*`

        console.log(`Reddit CleanUp init: ${postID}`)
        console.log(execSync(`${cmd_string1} && ${cmd_string2} && ${cmd_string3}`).toString())
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
        console.log(execSync(`${cmd_string1} && ${cmd_string2}`, { encoding: 'utf-8' }).toString())
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

const cmd_stacked_vids = `ffmpeg -i ${CONT_DIRS.ytVideos}/Q-TQQE1y68c.webm -t 00:00:10 -i ${CONT_DIRS.ytVideos}/si0Lp1SLHXg.webm -t 00:00:10 -filter_complex "[0]scale=1080:960, pad=1080:960:(ow-iw)/2:(oh-ih)/2[top]; 
         [1]scale=1080:960, pad=1080:960:(ow-iw)/2:(oh-ih)/2[bottom]; 
         [top][bottom]vstack,scale=1080:1920[out]; 
         [0:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo[audio_top]; 
         anullsrc=cl=stereo:r=44100[audio_silent]; 
         [audio_top][audio_silent]amix=inputs=2[audio]" -map "[out]" -map "[audio]" -c:v libx264 -c:a aac -b:a 192k test.mp4`

// Dev FN
try {
} catch (e) {
        console.error(e)
}

const { execSync } = require('child_process');
require('dotenv').config({ path: '../.env' });


const CONT_DIR = process.env.CONT_DIR

const CONT_DIRS = {
        Reddit_audio: `${CONT_DIR}/reddit_cont/audio_dir`,
        Reddit_srt: `${CONT_DIR}/reddit_cont/srt_dir`,
        ytVideos: `${CONT_DIR}/youTube_cont/videos`,
        ytSrt: `${CONT_DIR}/youTube_cont/srt`
}

export function create_story_over_single_video(rPostId: string, ytVideoId: string) {
        const cmd_story_over_single_video = `ffmpeg -i ${CONT_DIRS.ytVideos}/${ytVideoId}.mp4 -i ${CONT_DIRS.Reddit_audio}/${rPostId}.txt.mp3 -i ${CONT_DIRS.Reddit_srt}/${rPostId}.txt.srt -c:v libx264 -c:a aac -b:a 192k -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(1080-iw)/2:(1920-ih)/2,subtitles=${CONT_DIRS.Reddit_srt}/${rPostId}.txt.srt:force_style='FontSize=8,Alignment=2,PrimaryColour=&H00FF00&,MarginV=50'" -map 0:v -map 1:a -shortest -y ${rPostId}.mp4`;




        console.log(execSync(cmd_story_over_single_video).toString())
}

export function cut_video(startTime: string, videoID: string) {
        const cutCmd = `ffmpeg -ss ${startTime} -i ${CONT_DIRS.ytVideos}/${videoID}.mp4 -c copy -avoid_negative_ts make_zero ${CONT_DIRS.ytVideos}/${videoID}.mp4`

        console.log(execSync(cutCmd).toString())
}


const cmd_stacked_vids = `ffmpeg -i ${CONT_DIRS.ytVideos}/Q-TQQE1y68c.webm -t 00:00:10 -i ${CONT_DIRS.ytVideos}/si0Lp1SLHXg.webm -t 00:00:10 -filter_complex "[0]scale=1080:960, pad=1080:960:(ow-iw)/2:(oh-ih)/2[top]; 
         [1]scale=1080:960, pad=1080:960:(ow-iw)/2:(oh-ih)/2[bottom]; 
         [top][bottom]vstack,scale=1080:1920[out]; 
         [0:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo[audio_top]; 
         anullsrc=cl=stereo:r=44100[audio_silent]; 
         [audio_top][audio_silent]amix=inputs=2[audio]" -map "[out]" -map "[audio]" -c:v libx264 -c:a aac -b:a 192k test.mp4`
try {
        //        console.log(CONT_DIR)
} catch (e) {
        console.error(e)
}


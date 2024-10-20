import { selectAllFromVideo, selectAllFromReddit, REDDIT_POST_SCHEMA, VIDEO_SQL_SCHEMA } from '../db_dir/db_actions'
import { create_story_over_single_video, cut_video } from './ffmpegAPI'
require('dotenv').config('../.env');

async function gather_single_story() {
        let story_queue: REDDIT_POST_SCHEMA[] = []
        const allRedditStories: REDDIT_POST_SCHEMA[] = await selectAllFromReddit()
        const chosen_story = allRedditStories[0]
        const chosen_post_ID = chosen_story.postID?.slice(0, chosen_story.postID.length - 3)
        story_queue.push(chosen_story)

        for (let i = 1; i < allRedditStories.length; i++) {
                const postObj = allRedditStories[i]
                if (postObj.postID?.slice(0, postObj.postID.length - 3) === chosen_post_ID) {
                        story_queue.push(postObj)
                } else {
                        break
                }
        }
        return story_queue
}

function storyTime(storyData: REDDIT_POST_SCHEMA[]): number {
        let total_sec = 0
        for (const obj of storyData) {
                if (obj.postLen) {
                        const [hours, minutes, seconds] = obj.postLen?.split(':').map(Number)
                        total_sec += hours * 3600 + minutes * 60 + seconds
                }
        }
        return total_sec
}

function videoTime(videoData: VIDEO_SQL_SCHEMA[]): number {
        let total_sec = 0
        for (const obj of videoData) {
                const [hours, minutes, seconds] = obj.videoLen.split(':').map(Number)
                total_sec += hours * 3600 + minutes * 60 + seconds
        }
        return total_sec
}


(async function() {
        let videoQ_limit = 1
        const storyQ = await gather_single_story()
        let videoQ = await selectAllFromVideo(videoQ_limit)
        const storyQTime = storyTime(storyQ)
        let videoQTime = videoTime(videoQ)

        while (storyQTime > videoQTime) {
                videoQ_limit++
                videoQ = await selectAllFromVideo(videoQ_limit)
                videoQTime = videoTime(videoQ)
        }

        let currVideoTime = videoTime([videoQ[0]])
        let currStoryTime = 0
        let currVideoIndex = 0
        for (const part of storyQ) {
                currStoryTime = storyTime([part])
                if (currStoryTime > currVideoTime) {
                        currVideoIndex++
                } else if (part.postID) {
                        create_story_over_single_video(part.postID, videoQ[currVideoIndex].videoID)
                }
        }
        console.log(storyQ)
        console.log(videoQ)
})()



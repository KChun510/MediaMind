import { selectAllFromVideo, selectAllFromReddit, delVidData, delRedditData, updateVideoData, REDDIT_POST_SCHEMA, VIDEO_SQL_SCHEMA } from '../db_dir/db_actions'
import { create_story_over_single_video, cut_video, delete_video, delete_reddit_cont, segment_clip, downloadYTVideo, create_twoVids_OneStory } from '../sysCallAPI'
require('dotenv').config({ path: require('find-config')('.env') })

async function gather_single_story() {
        let story_queue: REDDIT_POST_SCHEMA[] = []
        const allRedditStories: REDDIT_POST_SCHEMA[] = await selectAllFromReddit()
        const chosen_story = allRedditStories[0]
        const chosen_post_ID = chosen_story.postID?.slice(0, chosen_story.postID.length - 3)
        story_queue.push(chosen_story)

        // Video data, appended to DB we junk it < 5000mb
        // This loop bellow checks for pt.2-pt.n
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

function updateTime(videoObj: VIDEO_SQL_SCHEMA, seconds: number) {
        let total_sec = 0
        let timeStamp = videoObj.videoLen
        const [hours, minutes, secs] = timeStamp.split(':').map(Number)
        total_sec += hours * 3600 + minutes * 60 + secs
        total_sec -= seconds

        const hoursReturn = Math.floor(total_sec / 3600);
        const minutesReturn = Math.floor((total_sec % 3600) / 60);
        const secsReturn = total_sec % 60;

        const returnStamp = [
                String(hoursReturn).padStart(2, '0'),
                String(minutesReturn).padStart(2, '0'),
                String(secsReturn).padStart(2, '0'),
        ].join(':');

        videoObj.videoLen = returnStamp

        return
}

function videoCleanUp(videoID: string) {
        delVidData(videoID)
        delete_video(videoID)
}

function redditCleanUp(postID: string) {
        delRedditData(postID)
        delete_reddit_cont(postID)
}


async function singleVidPlusStory() {
        let videoQ_limit = 1
        const storyQ = await gather_single_story()
        let videoQ = await selectAllFromVideo(videoQ_limit)
        const storyQTime = storyTime(storyQ)
        let videoQTime = videoTime(videoQ)

        // If the first vid we grab, has neg total time
        while (videoQTime < 0) {
                videoCleanUp(videoQ[0].videoID)
                videoQ = await selectAllFromVideo(videoQ_limit)
                videoQTime = videoTime(videoQ)
        }

        console.log("Gathering videos")
        // Gather enough vids, to meet story time
        while (storyQTime > videoQTime) {
                const prevVideoTime = videoQTime
                videoQ_limit++
                videoQ = await selectAllFromVideo(videoQ_limit)
                videoQTime = videoTime(videoQ)
                if (prevVideoTime === videoQTime) {
                        console.log(`Not enough videos to support clip, download more.`)
                        return
                }
                console.error(`story ${storyQTime}, video: ${videoQTime}`)
        }

        console.log("\nVideo Editing begun. \nFormat: singleVid singleStory")
        let currVideoTime = videoTime([videoQ[0]])
        let currStoryTime = 0
        let currVideoIndex = 0
        // The following logic gets complicated because it allows for mutliple videos to be used for a single story.
        for (const part of storyQ) {
                try {
                        currStoryTime = storyTime([part])
                        // Needed, logic deletes un-useable video
                        if (currStoryTime > currVideoTime) {
                                currVideoIndex++
                                currVideoTime = videoTime([videoQ[currVideoIndex]])
                                videoCleanUp(videoQ[currVideoIndex - 1].videoID)
                                console.log(`Video to be removed: ${videoQ[currVideoIndex - 1].videoID}`)
                                // Additional condition logic
                        } if (currVideoIndex >= videoQ.length) {
                                console.error("Currnet reddit Story excedes our video Q.")
                                return
                        } if (part.postID) {
                                // Updade the current video time (i.e: VieoTime - StoryTime)
                                updateTime(videoQ[currVideoIndex], currStoryTime)
                                create_story_over_single_video(part.postID, videoQ[currVideoIndex].videoID)
                                segment_clip(part.postID, 50)
                                updateVideoData({ videoLen: videoQ[currVideoIndex].videoLen, videoID: videoQ[currVideoIndex].videoID, videoName: videoQ[currVideoIndex].videoName })
                                // Need to cut our video, after clip was made ( No overlapping content )
                                cut_video(part.postLen ?? '00:00:00', videoQ[currVideoIndex].videoID)
                                redditCleanUp(part.postID)

                                console.log(`Clip made! ${part.postID}`)
                        }
                } catch (e) {
                        console.error(`There was a E, while editing video: ${videoQ[currVideoIndex].videoID} with post: ${part.postID}, \n e code of: ${e} `)
                }
        }
        console.log(storyQ)
        console.log(videoQ)
}


async function twoVidsPlusStory() {
        const storyQ = await gather_single_story()
        const storyQTime = storyTime(storyQ)

        let globalVideoQ = await selectAllFromVideo(10)
        let globalVideoQLog: string[] = []

        let video1: VIDEO_SQL_SCHEMA = { videoID: "", videoLen: "", videoName: "" }
        let video1Time = 0;

        let video2: VIDEO_SQL_SCHEMA = { videoID: "", videoLen: "", videoName: "" }
        let video2Time = 0;

        while (video1Time < storyQTime) {

                while (globalVideoQ.length < 1 || videoTime([globalVideoQ[0]]) < storyQTime) {
                        if (globalVideoQ.length < 1) {
                                await downloadYTVideo()
                                globalVideoQ = await selectAllFromVideo(10)
                        } else if (videoTime([globalVideoQ[0]]) < storyQTime) {
                                videoCleanUp(globalVideoQ[0].videoID)
                                await downloadYTVideo()
                                globalVideoQ = await selectAllFromVideo(10)
                        }
                }

                globalVideoQ.reverse()
                const valid_video = globalVideoQ.pop()
                if (valid_video) {
                        video1 = valid_video
                        globalVideoQLog.push(valid_video.videoID)
                        video1Time = videoTime([video1])
                }
                globalVideoQ.reverse()
        }

        while (video2Time < storyQTime) {
                while (globalVideoQ.length < 1 || videoTime([globalVideoQ[0]]) < storyQTime) {

                        if (globalVideoQ.length < 1) {
                                await downloadYTVideo()
                                globalVideoQ = (await selectAllFromVideo(10)).filter(obj => !(obj.videoID in globalVideoQLog));
                        } else if (videoTime([globalVideoQ[0]]) < storyQTime) {
                                videoCleanUp(globalVideoQ[0].videoID)
                                await downloadYTVideo()
                                globalVideoQ = (await selectAllFromVideo(10)).filter(obj => !(obj.videoID in globalVideoQLog));
                        }
                }

                globalVideoQ.reverse()
                const valid_video = globalVideoQ.pop()
                if (valid_video) {
                        video2 = valid_video
                        globalVideoQLog.push(valid_video.videoID)
                        video2Time = videoTime([video2])
                }
                globalVideoQ.reverse()
        }

        console.log("\nVideo Editing begun. \nFormat: TwoVids One Story")
        let currStoryTime = 0
        for (const part of storyQ) {
                try {
                        currStoryTime = storyTime([part])
                        // Needed, logic deletes un-useable video
                        if (part.postID) {
                                // Updade the current video time (i.e: VieoTime - StoryTime)
                                updateTime(video1, currStoryTime)
                                updateTime(video2, currStoryTime)
                                create_twoVids_OneStory(part.postID, video1.videoID, video2.videoID)
                                segment_clip(part.postID, 50)
                                updateVideoData({ videoLen: video1.videoLen, videoID: video1.videoID, videoName: video1.videoName })
                                updateVideoData({ videoLen: video2.videoLen, videoID: video2.videoID, videoName: video2.videoName })

                                // Need to cut our video, after clip was made ( No overlapping content )
                                cut_video(part.postLen ?? '00:00:00', video1.videoID)
                                cut_video(part.postLen ?? '00:00:00', video2.videoID)
                                redditCleanUp(part.postID)
                                console.log(`Clip made! ${part.postID}`)
                        }
                } catch (e) {
                        console.error(`There was a E, while editing video: ${video1.videoID} & ${video2.videoID} with post: ${part.postID}, \n e code of: ${e} `)
                }
        }
}

function getRandomInt(min: number, max: number) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
}

(async function() {
        switch (getRandomInt(0, 1)) {
                case 0:
                        singleVidPlusStory()
                        break
                case 1:
                        twoVidsPlusStory()
                        break
        }
})()



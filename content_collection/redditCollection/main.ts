import { POST_Get_Reddit_Post } from './redditAPI'
import { appendRedditPost } from '../../db_dir/db_actions'
import * as fs from 'fs'

interface redditPost {
	postID: string,
	postTitle: string,
	text: string
}

(async function() {
	//	const reddit_post = (await POST_Get_Reddit_Post('crazystories', 2))
	const reddit_post = (await POST_Get_Reddit_Post('nosleep', 4))
	for (const post of reddit_post) {
		const data = post as redditPost
		const filePath = `./reddit_content_format/input_content/text_storys/${data.postID}.txt`
		appendRedditPost({ postID: data.postID, postTitle: data.postTitle })
		fs.writeFile(filePath, data.text, (err) => {
			if (err) {
				console.error('Error writing to file: ', err)
			} else {
				console.log('Success writing to file: ', filePath)
			}
		})

	}
}())

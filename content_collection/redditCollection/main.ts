import { POST_Get_Reddit_Post } from './redditAPI'
import { appendRedditPost, appendInvalidID, pullAllInvRedditIDs } from '../../db_dir/db_actions'
import * as fs from 'fs'

interface redditPost {
	postID: string,
	postTitle: string,
	text: string
}

const byteSize = (outStr: string) => new Blob([outStr]).size

function writeTxtFile(filePath: string, data: string) {
	fs.writeFile(filePath, data, { encoding: 'utf8' }, (err) => {
		if (err) {
			console.error('Error writing to file: ', err)
		} else {
			console.log('Success writing to file: ', filePath)
		}
	})
}

function chunkFile(postID: string, postTitle: string, data: string) {
	let currStr = ""
	let partNumber = 1
	let currSize = 0
	const min = 4500


	// Because all of our chars, are normal vals a-z, A-Z. 
	// Each char is one Byte

	console.log(postID + " Is being chuncked into parts.")
	for (let i = 0; i < data.length; i++) {
		if (currSize < min) {
			currStr += data[i]
			currSize += 1
		} else if (currSize >= min) {
			if (data[i] == ' ') {
				const chunkedPostID = `${postID}-P${partNumber}`
				const filePath = `./reddit_content_format/input_content/text_storys/${chunkedPostID}.txt`
				writeTxtFile(filePath, currStr)
				appendRedditPost({ postID: chunkedPostID, postTitle: postTitle })
				currStr = ""
				partNumber += 1
				currSize = 0
			}
		}
	}
	const chunkedPostID = `${postID}-P${partNumber}`
	const filePath = `./reddit_content_format/input_content/text_storys/${chunkedPostID}.txt`
	writeTxtFile(filePath, currStr)
	appendRedditPost({ postID: chunkedPostID, postTitle: postTitle })

}


(async function() {
	const reddit_post = await POST_Get_Reddit_Post('crazystories', 2)
	const invalid_post = await pullAllInvRedditIDs()
	//	const reddit_post = (await POST_Get_Reddit_Post('nosleep', 4))
	for (const post of reddit_post) {
		const data = post as redditPost
		if (!invalid_post.includes(data.postID)) {
			appendInvalidID({ postID: data.postID })
			if (byteSize(data.text) >= 5000) {
				chunkFile(data.postID, data.postTitle, data.text)
			} else {
				const filePath = `./reddit_content_format/input_content/text_storys/${data.postID}.txt`
				writeTxtFile(filePath, data.text)
				appendRedditPost({ postID: data.postID, postTitle: data.postTitle })

			}
		}
	}
}())

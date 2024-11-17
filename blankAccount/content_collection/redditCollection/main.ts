import { OpenAI } from "openai"
import { POST_Get_Reddit_Post } from './redditAPI'
import { appendRedditPost, appendInvalidID, pullAllInvRedditIDs } from '../../db_dir/db_actions'
import { writeMetaData } from '../../sysCallAPI'
import * as util from 'util'
import * as fs from 'fs'
require('dotenv').config({ path: require('find-config')('.env') })

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

interface redditPost {
	postID: string,
	postTitle: string,
	text: string
}

enum subReddits {
	CRAZY_STORIES = 'crazystories',
	DRAMA = 'SubredditDrama',
	TECH_SUPPORT = 'talesfromtechsupport',
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


async function create_metaData(input: { valid_file: string, text_cont: string }) {
	const meta_data = await openai.chat.completions.create({
		messages: [{ role: "system", content: "You are tasked with analyzing text, creating a one sentance description in a entertaining and genuine tone of the text and a list of (4-6) popular hashtags about the text. You output the single sentance, then seperated by a new line you list the hashtags together seperated by one space between each one." },
		{ role: "user", content: `Here is the text analyze: ${input.text_cont}` }],
		model: "gpt-4o-mini",
	});
	const metaContent = meta_data.choices[0].message.content
	writeMetaData(input.valid_file, metaContent ?? "")
}


(async function() {
	const reddit_post = await POST_Get_Reddit_Post(subReddits.TECH_SUPPORT, 1)
	const invalid_post = await pullAllInvRedditIDs()
	//	const reddit_post = (await POST_Get_Reddit_Post('nosleep', 4))
	for (const post of reddit_post) {
		const data = post as redditPost
		if (!invalid_post.includes(data.postID)) {
			create_metaData({ valid_file: data.postID, text_cont: data.text })
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

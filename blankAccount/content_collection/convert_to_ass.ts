import * as fs from 'fs'
import * as readline from 'readline'
import * as path from 'path'
import { execSync, exec } from 'child_process'
require('dotenv').config({ path: require('find-config')('.env') })

enum effect_names {
	fadeIn_fadeOut = 'fadeIn_fadeOut',
	karaoke = 'karaoke',
	random = 'random'
}

enum effect_string {
	fadeIn_fadeOut = `{\\fad(10,10)\\t(0,200,\\fscx110\\fscy110)\\t(200,400,\\fscx100\\fscy100)\\move(540,960,545,965,0,400)}`
}

enum defualt_style {
	//Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
	white_bold = `Style: Default,Montserrat,95,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,1,0,0,0,100,100,0,0,1,5,0,5,10,10,20,1`
}

enum default_info {
	PlayResX = `PlayResX: 1080`,
	PlayResY = `PlayResY: 1920`,
	YCbCy = `YCbCr Matrix: TV.709`
}

enum content_type {
	reddit = "reddit",
	youTube = "youTube"
}

function getRandomInt(min: number, max: number) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function fadeIn_fadeOut(split_line: string[]) {
	const keyword = split_line[0]
	const data = split_line[1]
	let splitData = data.split(",")
	// apply the effect
	splitData[9] = `${effect_string.fadeIn_fadeOut}${splitData[9]}`

	return `${keyword}: ${splitData.join(',')}`
}

async function karoke(input: { outputStream: any, wordArr: string[][] }) {
	let currSentanceLen = getRandomInt(2, 5)

	// Line up timestamps
	for (let i = 0; i < input.wordArr.length - 1; i++) {
		const curr_data = input.wordArr[i][1]
		let curr_splitData = curr_data.split(",")

		const next_data = input.wordArr[i + 1][1]
		let next_splitData = next_data.split(",")
		next_splitData[1] = curr_splitData[2]
		input.wordArr[i + 1][1] = next_splitData.join(",")
	}

	// Apply highlighting to karaoke text
	input.wordArr = input.wordArr.reverse()
	while (input.wordArr.length > 0) {
		let curr_lines: string[][] = []
		for (let i = 0; i < currSentanceLen; i++) {
			const single_line = input.wordArr.pop()
			if (single_line) {
				curr_lines.push(single_line)
			}
		}

		let currSentance = ''
		for (const line of curr_lines) {
			const data = line[1]
			const splitData = data.split(",")
			currSentance += `${splitData[9]} `
		}

		let currWord = 0
		for (const line of curr_lines) {
			const keyword = line[0]
			const data = line[1]
			let splitData = data.split(",")
			let copyCurr = currSentance.split(" ")
			if (currWord < currSentanceLen) {
				copyCurr[currWord] = `{\\c&HFFFF00&}${copyCurr[currWord]}{\\r}`
				currWord += 1
			}

			splitData[9] = `${copyCurr.join(" ")}`
			input.outputStream.write(`${keyword} ${splitData.join(',')}` + '\n')
		}

		currSentanceLen = getRandomInt(2, 5)
	}
}

export async function convert_to_ass(input: { valid_file: string, effect_type: string, content_type: string }) {
	let cont_dir = ""

	if (input.effect_type === effect_names.random) {
		const effectNumb = getRandomInt(0, 1)
		if (effectNumb === 0) {
			input.effect_type = effect_names.fadeIn_fadeOut
		} else if (effectNumb === 1) {
			input.effect_type = effect_names.karaoke
		}
	}

	if (input.content_type === content_type.reddit) {
		cont_dir = `${process.env.CONT_DIR}/reddit_cont`
	} else if (input.content_type === content_type.youTube) {
		cont_dir = `${process.env.CONT_DIR}/youTube_cont`
	} else {
		throw new Error(`content_type: ${content_type}, does not exist.`)
	}

	// convert to ass file
	const ffmpegCMD = `ffmpeg -y -i ${cont_dir}/sub_dir/${input.valid_file}.srt -c:s ass ${cont_dir}/sub_dir/${input.valid_file}.ass`;
	execSync(ffmpegCMD, { encoding: 'utf8' })

	// Input and output file paths
	let karaokeArr: string[][] = []
	const inputFilePath = path.join(cont_dir, 'sub_dir', `${input.valid_file}.ass`)
	const outputFilePath = path.join(cont_dir, 'sub_dir', `${input.valid_file.split(".")[0]}.ass`)

	// Create read and write streams
	const inputStream = fs.createReadStream(inputFilePath)
	const outputStream = fs.createWriteStream(outputFilePath)

	// Create a readline interface to read line by line
	const rl = readline.createInterface({
		input: inputStream,
		crlfDelay: Infinity, // Handles Windows \r\n and UNIX \n line endings
	})

	// Event: Line by line processing
	rl.on('line', async (line) => {
		let split_line = line.split(" ")
		if (split_line[0] === 'PlayResX:') {
			outputStream.write(default_info.PlayResX + '\n')
			return
		} else if (split_line[0] === 'PlayResY:') {
			outputStream.write(default_info.PlayResY + '\n')
			return
		} else if (split_line[0] === `YCbCr`) {
			outputStream.write(default_info.YCbCy + '\n')
			return
		} else if (split_line[0] === 'Style:') {
			outputStream.write(defualt_style.white_bold + '\n')
			return
		}
		// Write each line to the output file
		if (input.effect_type === effect_names.fadeIn_fadeOut && split_line[0] === 'Dialogue:') {
			outputStream.write(await fadeIn_fadeOut(split_line) + '\n')
		} else if (input.effect_type === effect_names.karaoke && split_line[0] == 'Dialogue:') {
			karaokeArr.push(split_line)
		} else {
			outputStream.write(line + '\n')
		}
	})

	// Event: File reading complete
	rl.on('close', async () => {
		if (input.effect_type === effect_names.karaoke) {
			await karoke({ outputStream: outputStream, wordArr: karaokeArr })
			karaokeArr = []
		}
		outputStream.end()
	})

	// Error handling
	inputStream.on('error', (err) => {
		console.error('Error reading input file:', err.message)
	})

	outputStream.on('error', (err) => {
		console.error('Error writing to output file:', err.message)
	})
}


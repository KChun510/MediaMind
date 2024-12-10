const textToSpeech = require('@google-cloud/text-to-speech')
const fs = require('fs')
const util = require('util')
const OpenAI = require("openai")
import { updateRedditPost } from "../../../db_dir/db_actions"
import { tts_coqui, speed_up_audio } from "../../../sysCallAPI"
require('dotenv').config({ path: require('find-config')('.env') })

const gcpClient = new textToSpeech.TextToSpeechClient()
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const outPutDir = `${process.env.CONT_DIR}/reddit_cont`
const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)

async function list_input_files(): Promise<string[]> {
    return new Promise((resolve, reject) => {
        fs.readdir("./input_content/text_storys", (err, files) => {
            if (err) {
                reject(err); // Reject the promise if there's an error
            } else {
                const textFiles = files.filter(file => file.endsWith(".txt"))
                resolve(textFiles); // Resolve with the array of files
            }
        });
    });
};


// Check if the input file has already been proccessed before.

async function valid_input_files(input_files: string[]): Promise<string[]> {
    try {
        // Read CSV file
        let valid_files: string[] = [];
        const invalid_files = await fs.promises.readFile("./invalid_files/inv_txt.csv", 'utf8');
        let invalid_filesArray = invalid_files.split(',').map(item => item.trim());

        input_files.forEach(file => {
            if (!invalid_filesArray.includes(file)) {
                valid_files.push(file);
                invalid_filesArray.push(file);
            }
        });
        invalid_filesArray = invalid_filesArray.join(',');
        await fs.writeFile("./invalid_files/inv_txt.csv", invalid_filesArray, (err) => { console.log(err) });

        return valid_files; // Return the array of file names
    } catch (err) {
        console.error('Error reading CSV file', err);
        return []; // Return empty array in case of error
    }
};

async function text_to_speech(valid_file: string) {
    // Read text file from "input content folder"
    const fileContent = await readFile(`./input_content/text_storys/${valid_file}`, 'utf8');

    // Make a req to GCP, passing in file content
    const request = {
        input: { text: fileContent },
        voice: { languageCode: 'en-AU', name: 'en-AU-Wavenet-B', ssmlGender: 'MALE' },
        audioConfig: { audioEncoding: 'MP3', speakingRate: 1.2 },
    };
    const [response] = await gcpClient.synthesizeSpeech(request);

    console.log("Writing to the file")

    // Write audio file to audio_dir
    await writeFile(`${outPutDir}/audio_dir/${valid_file}.mp3`, response.audioContent, 'binary');
    console.log(`Audio content written to file: ${valid_file}.mp3`);

}
// Used for SRT output from openAI
function parse_transcript(trans: string): string {
    const transcript = trans.split("\n")
    let timeStamp = transcript[transcript.length - 5]
    let time = ""
    for (let i = 17; i <= 24; i++) {
        time += timeStamp[i]
    }
    return time
}

function formatTime(time: { secs: number, miliSec: string }): string {
    const miliSec = time.miliSec ? time.miliSec.slice(0, 3) : "000"
    const hoursReturn = Math.floor(time.secs / 3600);
    const minutesReturn = Math.floor((time.secs % 3600) / 60);
    const secsReturn = time.secs % 60;
    const returnStamp = [
        String(hoursReturn).padStart(2, '0'),
        String(minutesReturn).padStart(2, '0'),
        String(secsReturn).padStart(2, '0'),
    ].join(':');

    return returnStamp + `,${miliSec}`
}

async function speech_to_text(valid_file: string) {
    const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(`${outPutDir}/audio_dir/${valid_file}.mp3`),
        model: "whisper-1",
        response_format: "verbose_json",
        timestamp_granularities: ["word"]
    });
    let srt_string = ""
    for (let i = 0; i < transcription.words.length; i++) {
        const startTime = transcription.words[i].start.toString().split(".")
        const endTime = transcription.words[i].end.toString().split(".")
        const word = transcription.words[i].word.toUpperCase()
        srt_string += `${i + 1}\n${formatTime({ secs: startTime[0], miliSec: startTime[1] })} --> ${formatTime({ secs: endTime[0], miliSec: endTime[1] })}\n${word}\n\n`
    }
    const totalTime = transcription.duration.toString().split(".")
    const time_stamp = formatTime({ secs: totalTime[0], miliSec: totalTime[1] }).split(",")[0]

    updateRedditPost({ postLen: time_stamp, postID: valid_file.slice(0, valid_file.length - 4) })

    await writeFile(`${outPutDir}/srt_dir/${valid_file}.srt`, srt_string, 'utf8');
    console.log(`Transcription made, file: ${valid_file}`);
}

(async function() {
    const listed_files = await list_input_files();
    const valid_files = await valid_input_files(listed_files)
    console.log(`${valid_files.length} files, to be processed.`)
    for (let i = 0; i < valid_files.length; i++) {
        // Put the dir creating file here, + write text file of # and des
        await tts_coqui(valid_files[i], true)
        await speed_up_audio({ valid_file: valid_files[i], rate: "1.2" })
        // await text_to_speech(valid_files[i])
        await speech_to_text(valid_files[i])
    }
})()

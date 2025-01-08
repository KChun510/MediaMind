import fs from 'fs'
require('dotenv').config({ path: require('find-config')('.env') })
import { getInvVideoIds } from '../../db_dir/db_actions'

const clientID = process.env.CLIENT_ID ?? ""
const clientSecret = process.env.CLIENT_SECRET ?? ""

type Secret = {
	access_token: string,
	expires_in: number,
	token_type: string,
	exp_day?: number
}

function getCurrentDayOfYear(): number {
	const now = new Date()
	const startOfYear = new Date(now.getFullYear(), 0, 0)
	const diff = now.getTime() - startOfYear.getTime()
	const oneDay = 24 * 60 * 60 * 1000
	return Math.floor(diff / oneDay)
}

function getExpirationDayOfYear(expiresInSeconds: number): number {
	const now = new Date()
	const expirationDate = new Date(now.getTime() + expiresInSeconds * 1000)
	const adjustedDate = new Date(expirationDate.getTime() - 24 * 60 * 60 * 1000)
	const startOfYear = new Date(adjustedDate.getFullYear(), 0, 0)
	const diff = adjustedDate.getTime() - startOfYear.getTime()
	const oneDay = 24 * 60 * 60 * 1000
	return (Math.floor(diff / oneDay) - 2)
}

function readJsonFile(filePath = './twitch_clientSecret.json') {
	try {
		const data = fs.readFileSync(filePath, 'utf8')
		return JSON.parse(data)
	} catch (error) {
		console.error('Error reading JSON file:', error)
		return null
	}
}

function writeJsonFile(content: any, filePath = './twitch_clientSecret.json') {
	try {
		const jsonData = JSON.stringify(content, null, 2)
		fs.writeFileSync(filePath, jsonData, 'utf8')
	} catch (error) {
		console.error('Error writing JSON file:', error);
	}
}

async function fetchAccessToken(): Promise<Secret> {
	return (await fetch('https://id.twitch.tv/oauth2/token', {
		method: "POST",
		headers: new Headers({ "Content-Type": "application/x-www-form-urlencoded" }),
		body: new URLSearchParams({ client_id: clientID, client_secret: clientSecret, grant_type: 'client_credentials' })
	})).json()
}

async function getAccessToken() {
	let client_secrets: Secret = readJsonFile()
	if (client_secrets === null) {
		client_secrets = await fetchAccessToken()
	}
	const curr_day = getCurrentDayOfYear()
	if (client_secrets.exp_day === undefined || curr_day >= client_secrets.exp_day) {
		try {
			client_secrets['exp_day'] = getExpirationDayOfYear(client_secrets.expires_in)
			writeJsonFile(client_secrets)
		} catch (e) {
			throw new Error(e)
		}
	}
	return client_secrets.access_token
}

/*--- The Start of different Twitch End Points/ Write your own request ---*/

async function getUsers(input: { clientID: string }) {
	const accessToken = await getAccessToken()
	return (await fetch('https://api.twitch.tv/helix/users?login=kaicenat', {
		method: "GET",
		headers: new Headers({ Authorization: `Bearer ${accessToken}`, 'Client-Id': input.clientID }),
	})).json()
}

export async function getClips(input: { validClips: number, broadID?: string | undefined, gameID?: string | undefined } = { validClips: 1, broadID: undefined, gameID: undefined }) {
	const accessToken = await getAccessToken()
	const invClips = await getInvVideoIds()

	let urlParam = ''
	if (input.gameID === undefined && input.broadID !== undefined) {
		urlParam = `https://api.twitch.tv/helix/clips?broadcaster_id=${input.broadID}`
	}
	else if (input.broadID === undefined && input.gameID !== undefined) {
		urlParam = `https://api.twitch.tv/helix/clips?game_id=${input.gameID}`
	}

	// Section applying API filters.
	urlParam += '&first=50'

	let nextPage = ''
	let validVideoLog: any[] = []

	try {
		while (validVideoLog === undefined || validVideoLog.length < input.validClips) {
			const responce: any = await fetch(urlParam + "&after=" + nextPage, {
				method: "GET",
				headers: new Headers({ Authorization: `Bearer ${accessToken}`, 'Client-Id': clientID })
			}).then((responce) => responce.json())

			const data = responce.data
			nextPage = responce.pagination.cursor

			for (const obj of data) {
				if (validVideoLog.length >= input.validClips) {
					break
				} else if (obj.video_id !== '' && !invClips.includes(obj.id)) {
					validVideoLog.push(obj)
				}
			}
		}
		return validVideoLog
	} catch (e) {
		throw new Error(`E getting clips: ${e}`)
	}
}
/*
(async function() {
	const vidIdRes = await getClips({ validClips: 1, broadID: "641972806" })
	console.log(vidIdRes)

}())
*/


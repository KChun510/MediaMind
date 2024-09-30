import { pullAllRedditIDs } from '../../db_dir/db_actions'
const username = "";
const password = "";
const clientId = "";
const clientSecret = "";

const url = 'https://www.reddit.com/api/v1/access_token';

const auth_headers = new Headers({
	'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret),
	'Content-Type': 'application/x-www-form-urlencoded'
});

const auth_body = new URLSearchParams({
	'grant_type': 'password',
	'username': username,
	'password': password,
	'scope': 'read'
});

interface redditPost {
	postID: string,
	postTitle: string,
	text: string
}

// The bellows script will need to both append to DB and append text files in the workflow dir.
export async function POST_Get_Reddit_Post(sub_reddit: string, story_count = 1): Promise<redditPost[]> {
	const req_url = `https://www.reddit.com/r/${sub_reddit}/top.json?t=all&count=0&limit=25`
	const invalid_id = await pullAllRedditIDs()
	const final_res: redditPost[] = []
	try {
		while (story_count > 0) {

			const res = await fetch(req_url, { method: 'GET' });
			if (!res.ok) {
				throw new Error(`HTTP error! status: ${res.status} `);
			}
			const data: any = await res.json();
			const redditPosts = data.data.children
			for (const post of redditPosts) {

				const data: any = post.data
				const curr_str: string = data.selftext

				let temp_str: string[] = []
				let sqBracket_stack: string[] = []
				let bracket_stack: string[] = []
				let allow_gate = true

				if (!invalid_id.includes(data.id) && story_count > 0) {
					for (let i = 0; i < curr_str.length; i++) {
						const dec_val = curr_str.charCodeAt(i)
						if (dec_val === 91 || dec_val === 93) {
							allow_gate = false
							sqBracket_stack.push(curr_str[i])
							if (sqBracket_stack.length === 2) {
								allow_gate = true
								sqBracket_stack = []
							}
						} else if ((dec_val === 40 && curr_str.charCodeAt(i + 1) === 104 && curr_str.charCodeAt(i + 2) === 116) || (dec_val === 41 && bracket_stack.length > 0)) {
							allow_gate = false
							bracket_stack.push(curr_str[i])
							if (bracket_stack.length === 2) {
								allow_gate = true
								bracket_stack = []
							}
						}
						else if (((dec_val === 32) || (dec_val >= 65 && dec_val <= 90) || (dec_val >= 97 && dec_val <= 122) || (dec_val >= 44 && dec_val <= 46) || (dec_val === 58) || (dec_val === 40 || dec_val === 41)) && (allow_gate)) {
							temp_str.push(curr_str[i])
						} else if (dec_val === 47 && curr_str.charCodeAt(i + 1) === 110) {
							i += 2
						}
					}
					const final_str = temp_str.join('')
					final_res.push({ postID: data.id, postTitle: data.title, text: final_str })
					story_count -= 1
				}
			}
		} return final_res

	} catch (e) {
		console.error("Error: ", e);
		return final_res
	}
}

async function auth(): Promise<string | false> {
	try {
		const res = await fetch(url, { method: 'POST', headers: auth_headers, body: auth_body });
		if (!res.ok) {
			throw new Error(`HTTP error! status: ${res.status}`);
		}
		const data: any = await res.json();
		const auth_token: string = data.access_token; // Store the access token
		//console.log(data)
		return auth_token
	} catch (e) {
		console.error("Error: ", e);
		return false
	}


}

(async function() {
	//	console.log(await POST_REQ('crazystories', 2))
})();


// Notes for OAuth2.O.
// First request an Oauth Token, token is used for following API request.
// - To do so, here were using Oauth2.0 Basic.
// - In the header, send over our 'Basic' + clientId + ':' + clientSecret.
//    - With the content type
// - Then in the body send over the Acocunt creds.
// 
// After the above is done, we'll get an AUTH token. 

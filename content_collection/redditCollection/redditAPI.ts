import { pullAllInvRedditIDs } from '../../db_dir/db_actions'

interface redditPost {
	postID: string,
	postTitle: string,
	text: string
}
// The bellows script will need to both append to DB and append text files in the workflow dir.
export async function POST_Get_Reddit_Post(sub_reddit: string, story_count = 1): Promise<redditPost[]> {
	let page_count = 25
	let req_url = `https://www.reddit.com/r/${sub_reddit}/top.json?t=all&count=0&limit=${page_count}`
	const invalid_id = await pullAllInvRedditIDs()
	const final_res: redditPost[] = []
	let after = null
	try {
		while (story_count > 0) {
			if (after) {
				// Tyring to use the "after" param, but not working. Just going to increase the amound of searches.
				req_url = `https://www.reddit.com/r/${sub_reddit}/top.json?t=all&count=0&limit=${page_count}&after=${after}`
			}
			console.log("request being made")
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
					if (final_str.length == 0) {
						continue
					}
					final_res.push({ postID: data.id, postTitle: data.title, text: final_str })
					story_count -= 1
				}
			}
			if (page_count < 100) {
				page_count *= 2
			}
			after = redditPosts.pop().data.id
		} return final_res

	} catch (e) {
		console.error("Error: ", e);
		return final_res
	}
}

(async function() {
	//	console.log(await POST_REQ('crazystories', 2))
})();



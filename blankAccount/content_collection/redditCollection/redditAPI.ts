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
	console.log()
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
			console.log(req_url)
			
		
			const res = await fetch(req_url, {
				  "headers": {
				    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
				    "accept-language": "en-US,en;q=0.9",
				    "cache-control": "max-age=0",
				    "priority": "u=0, i",
				    "sec-ch-ua": "\"Chromium\";v=\"130\", \"Google Chrome\";v=\"130\", \"Not?A_Brand\";v=\"99\"",
				    "sec-ch-ua-mobile": "?0",
				    "sec-ch-ua-platform": "\"Linux\"",
				    "sec-fetch-dest": "document",
				    "sec-fetch-mode": "navigate",
				    "sec-fetch-site": "same-origin",
				    "sec-fetch-user": "?1",
				    "upgrade-insecure-requests": "1",
				    "cookie": "csv=2; edgebucket=ABE8mSDQHOsesVF82b; rdt=b53a294a0c134ed129c6784d172e826c; over18=true; reddit_session=eyJhbGciOiJSUzI1NiIsImtpZCI6IlNIQTI1NjpsVFdYNlFVUEloWktaRG1rR0pVd1gvdWNFK01BSjBYRE12RU1kNzVxTXQ4IiwidHlwIjoiSldUIn0.eyJzdWIiOiJ0Ml8xOXJxZTk4ajZwIiwiZXhwIjoxNzQ2MzIwMzQ3LjI2ODIxOSwiaWF0IjoxNzMwNjgxOTQ3LjI2ODIxOSwianRpIjoiNTlBX0ZWZkVITjJ5eHNFUWZaX3FreFBaRERiakZRIiwiY2lkIjoiY29va2llIiwibGNhIjoxNzI3NTc1MzkzNTk3LCJzY3AiOiJlSnlLamdVRUFBRF9fd0VWQUxrIiwidjEiOiIxMjkxMjMyMzY2NDc5NjksMjAyNC0xMS0wNFQwMDo1OTowNyw1NzZjZWU5ZDY1MTVhY2Q3YjMyZjk0ZGVhOWZkNDZiZGIyYWVlOThlIiwiZmxvIjoyfQ.hcZfUX_lT1TtzWnV77Hh-5df9w86rK9pP0ZaezKNsHvX67qrFsnJIj5n2QP5ASH2B_pfFo3_T3MO3JuhvmsTi3vx3EiDEvJ1MwyqCZYuDQh5MyxWsGezzWIlrcrQQd2FAxUp6IexfZFllODSP6pM1l7K-YOBwVdzZZgCDUEEEyDlHJ1C2xsjsjgUPSfPrN3Wfgk367w8uidhE7HQsf8gZtQhhe8mRzZgt8oY23aIPZes1iR4K3SRPMVWJg02VnoK9Z_zhPptfviBIQrO2LJGq3FNd8N5Tx_jis0KW2r_CuizCWxjr8ht3r1D0vKtjnvn5WgdaKS6-dNzMAUyMs-1mg; loid=0000000019rqe98j6p.2.1727575393597.Z0FBQUFBQm5LQnhiSlAwUWpPamtZaElQTlU2bTlqRFI2empsWEg2OTE3MkswMHhVS0xZaDRIYWVqcEpPRU5QX0RQbW5LcVEwT1ozVTI3clh0VHcwRm9UU2xlZjRrRTZ5WVNHSWlMa2NZY216UzZkQnBfYWpiU21DVEFxeGVfMVhpaDlQWEtCYzdGT04; token_v2=eyJhbGciOiJSUzI1NiIsImtpZCI6IlNIQTI1NjpzS3dsMnlsV0VtMjVmcXhwTU40cWY4MXE2OWFFdWFyMnpLMUdhVGxjdWNZIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ1c2VyIiwiZXhwIjoxNzMwNzY4MzQ3LjU0NjM2NCwiaWF0IjoxNzMwNjgxOTQ3LjU0NjM2NCwianRpIjoidlRCX1R6TDI0cnpEZXEyWHpxWFdNdERENUd2RVh3IiwiY2lkIjoiMFItV0FNaHVvby1NeVEiLCJsaWQiOiJ0Ml8xOXJxZTk4ajZwIiwiYWlkIjoidDJfMTlycWU5OGo2cCIsImxjYSI6MTcyNzU3NTM5MzU5Nywic2NwIjoiZUp4a2tkR090REFJaGQtbDF6N0JfeXBfTmh0c2NZYXNMUWFvazNuN0RWb2NrNzA3Y0w0aUhQOG5LSXFGTEUydUJLR2tLV0VGV3RPVU5pTHY1OHk5T1pFRlN5RlRSODQzeXdva2FVcFBVbU41cHlsUndXWmtMbGZhc1VLREI2WXBWUzZaMjBLUFM1dlEzSTFGejA2TXFseFdIdFRZbzNKcGJHTUsyeFBqemNacVF5cXV5NmxNWUZrb244V0xmdnlHLXRZLWY3YmZoSFl3cktnS0RfVE91Rnh3WV9IREZIYl9ucHIwYkYyd3FMM1hnOVEtMS1OMjdiTm1vZG01X1Z6UHZ6YVNjVG1HNWlmWXY3dC1DUjE0NUhtWlVRY3dZZzBfeXJBajZfQ3ZPb0RLQlFXTUpZaFBJNUFybDJfX0pkaXVUZjhhdHlkLS1HYkVUV180clJtbzV4TEVvVV9qNnpjQUFQX19YRF9lNHciLCJyY2lkIjoiRXBqd3k0UWNwVzVQTkxSY005YVVxUERJYVFMOE05aGNnY1RuQUNrdVVlUSIsImZsbyI6Mn0.cnKx_HOlbfPXNTpf7R1BPO1cg3Fmvm2L6IxUGizbD4u5cjB1pF64zyOb41XLVbql33S1vcpEnu3vB_N67C9K6vu_otFOGPzOcw8UeVEmlAc3JbYLRfw_mPrXaJr3VIVrUFRZcbajz5GHD6j1FuiLd7eDYON5X74-yVDHwacnj_s7TUw78e-1UIVQxSexGSr6nN6Udu2cm9WQ8WBuuejyhdTIzHMW6y0aRm_39dpM_gM184faGr3IjlOEWsdhwU_3Gi1zbrLpGlRy9iADlYUKS8fOtRVyZ5N07eH5gBSuL_6mnhkJA_meSzib1OpPLVLfCJKqFyW_KGkwxL034Waa4Q; reddit_chat_view=closed; pc=do; t2_19rqe98j6p_recentclicks3=t3_z6i3es; csrf_token=0887799baaa22ffff72ebc5377239b96; session_tracker=konrqrmaepfolerqlk.0.1730684500534.Z0FBQUFBQm5LQ1pVN0FrSmNuVXN6VWc2elFSY05IV0RRSmJoSWVJcG42ODVRaGVMbWQzX0ZSZXlaUEsxWVFRaW9BYm9jZ0V3S1RqeEZrcXZOSUo1TjFEVjhYY2lkaVVMaEJJWXczZU9RdmZ0a0JEZnptdFBxS1VmU0Vpb3VidEJPYWU2QlJrSnpNQ1Q",
				    "Referer": "https://www.reddit.com/r/learnprogramming/comments/z6i3es/nocredential_reddit_api_call_getting_blocked/",
				    "Referrer-Policy": "strict-origin-when-cross-origin"
				  },
				  "body": null,
				  "method": "GET"
				});
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



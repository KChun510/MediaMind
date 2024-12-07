import * as sqlite3 from 'sqlite3';

enum TABLE_NAMES {
	reddit_cont = 'reddit_cont',
	mainVideo_cont = 'mainVideo_cont',
	video_cont = 'video_cont',
	invalid_storys = 'invalid_storys',
	invalid_videos = `invalid_videos`
}

export type VIDEO_SQL_SCHEMA = {
	videoID: string,
	videoLen: string,
	videoName: string,
};

export type REDDIT_POST_SCHEMA = {
	postID?: string,
	postLen?: string,
	postTitle?: string
}

// Our db connector
let db = new sqlite3.Database(`${__dirname}/video_data.db`, (err: Error | null) => {
	if (err) {
		console.log(err.message);
	}
	console.log('Connected to the SQLite database.')
});

export const appendInvalidID = (arg: REDDIT_POST_SCHEMA) => {
	const insertSql = `INSERT INTO ${TABLE_NAMES.invalid_storys} (postID) VALUES (?)`
	db.run(insertSql, [arg.postID], function(err: Error | null) {
		if (err) {
			console.log(err.message)

		} else {
			console.log(`${arg.postID} has been logged to invalid_storys`)
		}
	})
}

export const appendRedditPost = (arg: REDDIT_POST_SCHEMA) => {
	const insertSql = `INSERT INTO ${TABLE_NAMES.reddit_cont} (postID, postTitle) VALUES (?, ?)`
	db.run(insertSql, [arg.postID, arg.postTitle], function(err: Error | null) {
		if (err) {
			console.log(err.message)
		} else {
			console.log(`Reddit data has been appended with rowID ${this.lastID}`)
		}
	})

}

export const updateRedditPost = (arg: REDDIT_POST_SCHEMA) => {
	const updateSql = `UPDATE ${TABLE_NAMES.reddit_cont} SET postLen = ? where postID = ?`
	db.run(updateSql, [arg.postLen, arg.postID], function(err: Error | null) {
		if (err) {
			console.log(err.message)
		} else {
			console.log(`Post with ID: ${arg.postID}, time has been added.`)
		}
	})
}

export const appendVideoItem = (arg: VIDEO_SQL_SCHEMA) => {
	const insertSql = `INSERT INTO ${TABLE_NAMES.video_cont} (videoID, videoLen, videoName) VALUES (?, ?, ?)`;
	db.run(insertSql, [arg.videoID, arg.videoLen, arg.videoName], function(err: Error | null) {
		if (err) {
			console.log(err.message);
		} else {
			console.log(`Video data has been appended with rowID ${this.lastID}`)
		}
	});
};

export const appendMainVideoItem = (arg: VIDEO_SQL_SCHEMA) => {
	const insertSql = `INSERT INTO ${TABLE_NAMES.mainVideo_cont} (videoID, videoLen, videoName) VALUES (?, ?, ?)`;
	db.run(insertSql, [arg.videoID, arg.videoLen, arg.videoName], function(err: Error | null) {
		if (err) {
			console.log(err.message);
		} else {
			console.log(`Video data has been appended with rowID ${this.lastID}`)
		}
	});
};

interface VideoRow {
	videoID: string; // Adjust the type if needed
}

export const pullAllVidIDs = (): Promise<string[]> => {
	return new Promise((res, rej) => {
		db.all(`SELECT videoID FROM ${TABLE_NAMES.video_cont}`, (err, rows: VideoRow[]) => {
			if (err) {
				return rej(err)
			} else {
				const videoIDs: string[] = rows.map(({ videoID }) => videoID)
				return res(videoIDs)
			}
		})
	})
}

interface RedditRow {
	postID: string,
}

export const pullAllInvRedditIDs = (): Promise<string[]> => {
	return new Promise((res, rej) => {
		db.all(`SELECT postID from ${TABLE_NAMES.invalid_storys}`, (err, rows: RedditRow[]) => {
			if (err) {
				return rej(err)
			} else {
				const postIDs: string[] = rows.map(({ postID }) => postID)
				return res(postIDs)
			}
		})
	})
}

export const selectAllFromVideo = (limit: number): Promise<VIDEO_SQL_SCHEMA[]> => {
	return new Promise((res, rej) => {
		db.all(`SELECT * FROM video_cont LIMIT ${limit}`, (err, row: VIDEO_SQL_SCHEMA[]) => {
			if (err) {
				return rej(err)
			} else {
				return res(row)
			}
		})

	})
}

export const selectAllFromMainVideo = (limit: number): Promise<VIDEO_SQL_SCHEMA[]> => {
	return new Promise((res, rej) => {
		db.all(`SELECT * FROM mainVideo_cont LIMIT ${limit}`, (err, row: VIDEO_SQL_SCHEMA[]) => {
			if (err) {
				return rej(err)
			} else {
				return res(row)
			}
		})

	})
}

export const selectAllFromReddit = (): Promise<REDDIT_POST_SCHEMA[]> => {
	return new Promise((res, rej) => {
		db.all(`SELECT * FROM reddit_cont`, (err, row: REDDIT_POST_SCHEMA[]) => {
			if (err) {
				return rej(err)
			} else {
				return res(row)
			}
		})
	})
}

type timeStamp = {
	postLen?: string,
	videoLen?: string,
}

function convertTimeStamp(timeStamps: timeStamp[]): number {
	let total_sec = 0
	for (const time of timeStamps) {
		const currTimeStamp = time.postLen ?? time.videoLen ?? "000:000:000"
		const [hours, minutes, seconds] = currTimeStamp.split(':').map(Number)
		total_sec += hours * 3600 + minutes * 60 + seconds
	}
	return total_sec
}

export const getTotalRedditTime = (): Promise<number | Error> => {
	return new Promise((res, rej) => {
		db.all(`SELECT postLen FROM reddit_cont;`, (err, row: timeStamp[]) => {
			if (err) {
				return rej(err)
			} else {
				return res(convertTimeStamp(row))
			}
		})
	})
}

export const getTotalVideoTime = (): Promise<number | Error> => {
	return new Promise((res, rej) => {
		db.all(`SELECT videoLen FROM video_cont;`, (err, row: timeStamp[]) => {
			if (err) {
				return rej(err)
			} else {
				return res(convertTimeStamp(row))
			}
		})
	})
}

export const getInvVideoIds = () => {
	return new Promise((res, rej) => {
		db.all(`SELECT * FROM ${TABLE_NAMES.invalid_videos}`, (err, rows: { videoID: string }[]) => {
			if (err) {
				return rej(err)
			} else {
				const videoId: string[] = rows.map(({ videoID }) => videoID)
				return res(videoId)
			}
		})
	})
}

export const delRedditData = (postID: string) => {
	const deleteSql = `DELETE FROM	${TABLE_NAMES.reddit_cont} WHERE postID = "${postID}"`
	db.run(deleteSql, function(err: Error | null) {
		if (err) {
			console.log(err.message)
		}
		else {
			console.log(`rPost with ID: ${postID} removed`)
		}
	})
}

export const appendInvVidID = (videoID: string) => {
	const insertSql = `INSERT INTO ${TABLE_NAMES.invalid_videos} (videoID) VALUES (?)`
	db.run(insertSql, [videoID], function(err: Error | null) {
		if (err) {
			console.log(err.message)
		} else {
			console.log(`Video with ID: ${videoID} added to inv log.`)
		}
	}
	)
}
export const delVidData = (videoID: string) => {
	const deleteSql = `DELETE FROM ${TABLE_NAMES.video_cont} WHERE videoID = "${videoID}"`
	db.run(deleteSql, function(err: Error | null) {
		if (err) {
			console.log(err.message);
		} else {
			console.log(`Video with ID: ${videoID} removed.`);
		}
	});
};

export const delMainVidData = (videoID: string) => {
	const deleteSql = `DELETE FROM ${TABLE_NAMES.mainVideo_cont} WHERE videoID = "${videoID}"`
	db.run(deleteSql, function(err: Error | null) {
		if (err) {
			console.log(err.message);
		} else {
			console.log(`Video with ID: ${videoID} removed.`);
		}
	});
};

export const updateVideoData = (arg: VIDEO_SQL_SCHEMA) => {
	const updateSql = `UPDATE ${TABLE_NAMES.video_cont} SET videoLen = ? where videoID = ?`
	db.run(updateSql, [arg.videoLen, arg.videoID], function(err: Error | null) {
		if (err) {
			console.log(err.message)
		} else {
			console.log(`Video with ID: ${arg.videoID}, time stamp updated.`)
		}
	})
}
// Dev F(n)
/*
(async function() {
	console.log(await getTotalRedditTime())
	console.log(await getTotalVideoTime())

}())
*/


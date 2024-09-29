import * as sqlite3 from 'sqlite3';

enum TABLE_NAMES {
	reddit_cont = 'reddit_cont',
	video_cont = 'video_cont',
}

type VIDEO_SQL_SCHEMA = {
	videoID: string,
	videoLen: string,
	videoName: string,
};


// Our db connector
let db = new sqlite3.Database(`${__dirname}/video_data.db`, (err: Error | null) => {
	if (err) {
		console.log(err.message);
	}
	console.log('Connected to the SQLite database.')
});

export const appendVideoItem = (arg: VIDEO_SQL_SCHEMA) => {
	const insertSql = `INSERT INTO ${TABLE_NAMES.video_cont} (videoID, videoLen, videoName) VALUES (?, ?, ?)`;
	db.run(insertSql, [arg.videoID, arg.videoLen, arg.videoName], function(err: Error | null) {
		if (err) {
			console.log(err.message);
		} else {
			console.log(`A row has been appended with rowID ${this.lastID}`)
		}
	});
};

export const pullAllVidIDs = (): Promise<string[]> => {
	return new Promise((res, rej) => {
		db.all("SELECT videoID FROM video_cont", (err, rows: any) => {
			if (err) {
				return rej(err)
			} else {
				const videoIDs: string[] = rows.map(({ videoID }) => videoID)
				return res(videoIDs)
			}
		})
	})
}

/*
export const appendRedditItem  = (arg: SQL_SCHEMA) => {
    const insertSql = `INSERT INTO ${TABLE_NAMES.video_cont} (videoID, videoLen, videoName) VALUES (?, ?, ?)`;
    db.run(insertSql, [arg.R_ID, arg.Item, arg.Price, arg.Cals], function(err: Error | null){
	if(err){
	    console.log(err.message);
	}
	console.log(`A row has been appended with rowID ${this.lastID}`)
    });
};
*/


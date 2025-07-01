# Dependencies

1. **FFmpeg**
2. **Youtube-dl**
    - [GitHub Issue](https://github.com/ytdl-org/youtube-dl/issues/32647#issuecomment-1827487371)
    - [Ask Ubuntu](https://askubuntu.com/questions/1037666/youtube-dl-python-not-found-18-04)
    - [Brew Install](https://formulae.brew.sh/formula/yt-dlp)
3. **Node.js**
    - [Download Node.js](https://nodejs.org/en/download/package-manager)
4. **Google Cloud SDK + ADC**
    - [Google Cloud Authentication](https://cloud.google.com/docs/authentication/provide-credentials-adc)
5. **SQLite3**
    - npm install sqlite3

## Google Cloud Platform

- **Gcloud Text to Speech**
    - [Documentation](https://cloud.google.com/docs/authentication/provide-credentials-adc)

- **YouTube API**
    - Download OAuth JSON: [API Credentials](https://console.cloud.google.com/apis/credentials?authuser=3&hl=en&project=auto-cont-gen)  
    Place that JSON file in the working directory, then rename it to `client_secret.json`.  
    Follow the steps from this link: [YouTube API Quickstart](https://developers.google.com/youtube/v3/quickstart/nodejs)
<br></br>

Notes: 
Also if using a new GCP account the above APIs have to be re-enabled.
Will need a valid GCP account with billing.
<br></br>

Current Design of the system:
<br></br>
![alt text](https://github.com/KChun510/auto_cont_gen/blob/c7cacaaea24663360c97f64ded710ecb17bda962/diagrams/auto_cont_gen11_12_24.drawio.png)
<br></br>

Current Design of editing algorithm:
<br></br>
![alt text](https://github.com/KChun510/auto_cont_gen/blob/e5a002c93cc1b84001c752c8baffa8df3c42e670/diagrams/video_edit_algo.drawio.png)
<br></br>


### Common Errors:
1. **Getting "invalid grant" from the YouTube Data API?**
     - Navigate to "~Home/.Credentials". And remove the client json file.
     - Re-run the script. 


### Dev Notes:
1. cop.action.news, TTS is bumping our openAI API usage to .08 cents a day. I.e: 30 bucks a year.
    - Options: Use the YT subtitles, or remove -or- Use a free TTS model.
2. Auto-post, save this for last some human intervention needed.


### Future Works:
1. Implement MAOP (Multi-Agent Oriented Prgramming)
    - Our agent will be a AI model.
    - Use this agent on making decions on what kind of videos we want to download.
    - Or control the editing of videos.
    - Use it to evaluate the most revelent topics in current timeline.
    - etc.....

2. break accounts into objects / own personas!!


<sub><sup>Updated: 11/26/24</sup></sub>

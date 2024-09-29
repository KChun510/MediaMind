# Dependencies

1. **FFmpeg**
2. **Youtube-dl**
    - [GitHub Issue](https://github.com/ytdl-org/youtube-dl/issues/32647#issuecomment-1827487371)
    - [Ask Ubuntu](https://askubuntu.com/questions/1037666/youtube-dl-python-not-found-18-04)
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
Current account kchun1080@gmail.com
<br></br>
Current Design of the system:
![alt text](https://github.com/KChun510/auto_cont_gen/blob/872c82fecb8f03755b2fff0488f726890d193a63/diagrams/auto_cont_gen.drawio.png)

<br></br>


### Dev Notes:
1. **SQLite** will be using this heavily down the line.
    - Store YT Vid id's as UNID, and video times in next cell.
    - Will be used for the cutting of videos.
    - A Case: When we layer our story's over gameplay.
2. **HDD Storage**
    - Make sure to set the HDD location for Video storage, in " content_generator{MAC -or- UBUNTU} ".


<sub><sup>Updated: 9/27/24 </sup></sub>

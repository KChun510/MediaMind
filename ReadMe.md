Dependancies.

1.FFmpeg
2.Youtube-dl
  https://github.com/ytdl-org/youtube-dl/issues/32647#issuecomment-1827487371
  https://askubuntu.com/questions/1037666/youtube-dl-python-not-found-18-04
3. Node.js
  link: https://nodejs.org/en/download/package-manager
4. Google Cloud SDK + ADC
  link: https://cloud.google.com/docs/authentication/provide-credentials-adc


Google Cloud Platform:
- Gcloud Text to speech
  link: https://cloud.google.com/docs/authentication/provide-credentials-adc

- YouTube API
  Download Oauth Json: https://console.cloud.google.com/apis/credentials?authuser=3&hl=en&project=auto-cont-gen
  Place that Json file in the working dir, then rename to client_secret.json.
  Go to link bellow, follow from step 2.
  Link: https://developers.google.com/youtube/v3/quickstart/nodejs


Notes: 
Also if using a new GCP account the above API's have to be re-enabled.
Will need a valid GCP account with billing.
Current account kchun1080@gmail.com

Current Design of the system:
![alt text](https://github.com/KChun510/auto_cont_gen/blob/0e581b80ece6ae74c47da919546873a0feba2a3f/diagrams/auto_cont_gen.drawio.png)


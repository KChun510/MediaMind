Dependancies.

1.FFmpeg
2.Youtube-dl
  - https://github.com/ytdl-org/youtube-dl/issues/32647#issuecomment-1827487371
  - https://askubuntu.com/questions/1037666/youtube-dl-python-not-found-18-04
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
![alt text](https://viewer.diagrams.net/?tags=%7B%7D&lightbox=1&highlight=0000ff&edit=_blank&layers=1&nav=1&title=auto_cont_gen.drawio#R%3Cmxfile%3E%3Cdiagram%20id%3D%22C5RBs43oDa-KdzZeNtuy%22%20name%3D%22Page-1%22%3E7VhbU%2BIwFP41PMrQC7dHRXB13R1ddxffnNDGNkvadJNAwV%2B%2FJzS9g6gDIjvOOJicnNy%2B78s5aRrWIFhccBT535iLacNsuYuGdd4wTcMwzYb6a7nLxNI1tMHjxNVOueGOPGFtbGnrjLhYlBwlY1SSqGx0WBhiR5ZsiHMWl90eGS3PGiEP1wx3DqJ165i40k%2BsPbOb279g4vnpzEann7QEKHXWOxE%2BcllcMFnDhjXgjMmkFCwGmCrwUlzGl8sxvZ52Lq5uxV%2F06%2Bzrz%2B%2B%2FT5LBRq%2Fpkm2B41C%2BeejbSz5F3Xh441kXY3N0%2F4OJ%2B5N0b3NEZxowvVm5TBGcYy4JAHqNJpjeMEEkYSE0TZiULGhYZ6nDKSWeapAsAqsvAwoVA4oZci2ouEj42NUVITmbZsRo30hNHCw8JcgmYaJJzrwRRTLzHzDK%2BGpxltEDyibQovcBS8GLCvNbYDMyLuEQYBZgyZfQLy6oxdIw%2BQWldLraiLRCvaxvzgIUNBGvIKXOCagsBMsVg52eNswOVVhMOJQ8udp7BwUK83Ai1D84SxL2%2FODhEHMkGW8Kv0YrZ7PQXRGhYI99IvFdhBzVGgPyZQZ3jq4exUoFqKNLCnQBfMNeA%2F7esDe2n4dUoYKEHsWnKkYpWRMO4Ss5GYLN1OoPBmqvDKph1lE11yl6X6CaNVCFRFw%2BKJ3CD6UJckejUrN1aJl2tssUu5AHdRXTCYuHueFsZYAGn3HyBCwgqoyhq9V87lAkBHHK8DozPs8id05MK%2BmqU39vFaWB3UI9WZta0K4jc3sN6KmNY8gZZF6ecx0TeoYbRmA1Gel2t0K6XSETTjl3sO5VTLyVgdoV9Rj9ykCAlodlbaCVMLJtv10r3U%2BtHK1WzHfWSm9DpObYdYls%2FhEfM0C3rQpsnTUB%2Bl1TXn8DkEu4Gswm%2BGiQNA6OZPoh%2BV9dyaw1N4j3RbV%2B0U0E%2Bsg4fPlKAPJormMZuIf7aqjfcD9z7I5zrGWUWbcNu2lXRnlpms3W9MxYGzItMIKWBbdIOYjNyzZ77U1T5YpLBt1pJjfsmiSTJP6Qvg4kJz19TXDJPH9OGMWMTx8pi1d5KnEAa8nn2chQUOm6ILGvyGC0PlxkeMHt%2B%2BiyV3bdPVj2qt9TIybk9ox1IF1WM1bb7u9Nl1DN36STaJK%2F7FvDfw%3D%3D%3C%2Fdiagram%3E%3C%2Fmxfile%3E)


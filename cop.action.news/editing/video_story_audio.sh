ffmpeg -ss 00:00:30 -i input_video.mp4 -i audio.mp3 -i subtitles.srt -c:v copy -c:a aac -b:a 192k -vf "subtitles=subtitles.srt" -shortest output_video.mp4


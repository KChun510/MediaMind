ffmpeg \\
    -i codeShort.mp4 \\
    -t 00:00:10 \\
    -i ytShort.mp4 \\
    -t 00:00:10 \\
    -filter_complex \\
        "[0]scale=1080:960, pad=1080:960:(ow-iw)/2:(oh-ih)/2[top]; \\
         [1]scale=1080:960, pad=1080:960:(ow-iw)/2:(oh-ih)/2[bottom]; \\
         [top][bottom]vstack,scale=1080:1920[out]; \\
         [0:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo[audio_top]; \\
         anullsrc=cl=stereo:r=44100[audio_silent]; \\
         [audio_top][audio_silent]amix=inputs=2[audio]" \\
    -map "[out]" \\
    -map "[audio]" \\
    -c:v libx264 -c:a aac -b:a 192k \\
    test.mp4\

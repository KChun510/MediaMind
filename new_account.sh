CONT_DIR="/mnt/md0/work_station/content_for_system"
read -p "Name of new Account: " name
mkdir $CONT_DIR/$name
mkdir $CONT_DIR/$name/reddit_cont $CONT_DIR/$name/reddit_cont/audio_dir $CONT_DIR/$name/reddit_cont/srt_dir
mkdir $CONT_DIR/$name/youTube_cont $CONT_DIR/$name/youTube_cont/srt $CONT_DIR/$name/youTube_cont/videos
mkdir $CONT_DIR/$name/prod_vids $CONT_DIR/$name/prod_vids/single_vid_plus_reddit
cp -r blankAccount ./$name
printf "OPENAI_API_KEY=''\nCONT_DIR='$CONT_DIR/$name'" > ./$name/.env
printf "Dont forget upload:\n1) .env file\n2) client-secret.json\n3) crontTab\n4) Change sub-reddit"

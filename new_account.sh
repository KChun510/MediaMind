#!/bin/bash
CONT_DIR="$HOME/Desktop/content_for_system/"
read -p "Name of new Account: " name
read -p $'What kind of account: \n1) Text_based \n2) Video_based \n3) Twitch_based\nEnter your option: ' accountType

case $accountType in 
	1)
		cp -r blankAccount/. ./$name
		;;
	2)
		cp -r blankAccount_videoBased/. ./$name
		;;
	3)
		cp -r blankAccount_twitchBased/. ./$name
		;;
	*)
		echo "Not a valid option: $accountType"
		exit 1
		;;
esac

mkdir -p $CONT_DIR/$name/overlay_png
mkdir -p $CONT_DIR/$name/reddit_cont $CONT_DIR/$name/reddit_cont/audio_dir $CONT_DIR/$name/reddit_cont/sub_dir
mkdir -p $CONT_DIR/$name/youTube_cont $CONT_DIR/$name/youTube_cont/sub_dir $CONT_DIR/$name/youTube_cont/video_dir
mkdir -p $CONT_DIR/$name/prod_vids $CONT_DIR/$name/prod_vids/single_vid_plus_reddit
mkdir -p $CONT_DIR/$name/prod_vids $CONT_DIR/$name/prod_vids/video_plus_sub
mkdir -p $CONT_DIR/$name/prod_vids $CONT_DIR/$name/prod_vids/twoVids_oneMain
 

printf "OPENAI_API_KEY=''\nCONT_DIR='$CONT_DIR/$name'" > ./$name/.env
printf "Dont forget upload:\n1) .env file\n2) client-secret.json\n3) crontTab\n4) Change sub-reddit"

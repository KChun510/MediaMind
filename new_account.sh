#!/bin/bash
CONT_DIR=/Users/westcoasttoast/Desktop/content_for_system
read -p "Name of new Account: " name
read -p $'What kind of account: \n1) Text_based \n2) Video_based\nEnter your option: ' accountType

case $accountType in 
	1)
		cp -r blankAccount ./$name
		;;
	2)
		cp -r blankAccount_videoBased ./$name
		;;
	*)
		echo "Not a valid option: $accountType"
		exit 1
		;;
esac

mkdir -p $CONT_DIR/$name/reddit_cont $CONT_DIR/$name/reddit_cont/audio_dir $CONT_DIR/$name/reddit_cont/sub_dir
mkdir -p $CONT_DIR/$name/youTube_cont $CONT_DIR/$name/youTube_cont/sub_dir $CONT_DIR/$name/youTube_cont/video_dir
mkdir -p $CONT_DIR/$name/prod_vids $CONT_DIR/$name/prod_vids/single_vid_plus_reddit
mkdir -p $CONT_DIR/$name/prod_vids $CONT_DIR/$name/prod_vids/video_plus_sub
mkdir -p $CONT_DIR/$name/prod_vids $CONT_DIR/$name/prod_vids/twoVids_oneMain
 

printf "OPENAI_API_KEY=''\nCONT_DIR='$CONT_DIR/$name'" > ./$name/.env

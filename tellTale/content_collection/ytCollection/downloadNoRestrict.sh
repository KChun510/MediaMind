#!/bin/bash
source ../../.env

npx tsx './downloadNoRestrict.ts'
# Need to convert all to mp4
for file in "${CONT_DIR}/youTube_cont/videos/"*.{webm,mkv}; do
    echo "Processing: $file"
    if [[ -f "$file" ]]; then
        # Determine the output file name
        output_file="${file%.*}.mp4"
        
        # Convert to .mp4
        ffmpeg -i "$file" -crf 1 -c:v libx264 -b:v 1500k -c:a aac -b:a 192k "$output_file"
        
        # Check if the conversion was successful before deleting
        if [[ $? -eq 0 ]]; then
            # Delete the old .webm or .mkv file
            rm "$file"
            echo "Deleted: $file"
        else
            echo "Failed to convert: $file"
        fi
    fi
done



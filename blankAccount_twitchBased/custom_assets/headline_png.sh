#!/bin/bash
source ../.env

output_file_name="$1"
shift # Remove the first arg from the positional params

# Define text lines (first line with the PNG at both ends)
lines=("Breaking News!" "$@")

# Output image size
width=500
height=300

# Create a blank transparent canvas
magick -size ${width}x${height} xc:none -colorspace sRGB $CONT_DIR/overlay_png/"$output_file_name".png

# Position variables
y_offset=20
font="Arial-Bold"  # Use a fallback font
font_size=24
highlight_color="white"  # Pure white highlight
text_color="black"
corner_radius=4 # Radius for rounded corners

# Fixed height for text box and siren
box_height=40
siren_height=30

# Path to the siren PNG image (change to your actual file path)
siren_image="./png_assets/siren.png"  # Replace with actual siren image file

# Resize the siren to the fixed height once
resized_siren="resized_siren.png"
magick $siren_image -resize x${siren_height} -colorspace sRGB $resized_siren

# Get dimensions of the resized siren
png_width=$(magick identify -format "%w" $resized_siren)

# Loop through each line of text
for i in "${!lines[@]}"; do

  line="${lines[$i]}"

  # Create the text and measure its dimensions
  magick -background none -font $font -pointsize $font_size \
    label:"$line" miff:- | magick identify -format '%w %h' - > dimensions.txt
  text_width=$(awk '{print $1}' dimensions.txt)
  text_height=$(awk '{print $2}' dimensions.txt)

  if [ $i -eq 0 ]; then
    # Calculate new width to fit the PNG at both ends
    total_width=$((text_width + 2 * png_width + 40))
  else
    # No siren on this line
    total_width=$((text_width + 20))
  fi

  # Calculate x position for centered alignment
  x_offset=$(( (width - total_width) / 2 ))

  # Draw the rounded rectangle
  magick $CONT_DIR/overlay_png/"$output_file_name".png -fill $highlight_color -colorspace sRGB \
    -draw "roundrectangle $x_offset,$y_offset $((x_offset + total_width)),$((y_offset + box_height)) $corner_radius,$corner_radius" \
    $CONT_DIR/overlay_png/"$output_file_name".png


  # Overlay the siren PNGs and text for the first line
  if [ $i -eq 0 ]; then
    siren_x_start=$((x_offset + 10))
    siren_x_end=$((x_offset + total_width - png_width - 10))
    magick $CONT_DIR/overlay_png/"$output_file_name".png $resized_siren -geometry +$siren_x_start+$((y_offset + (box_height - siren_height) / 2)) -colorspace sRGB -composite $CONT_DIR/overlay_png/"$output_file_name".png
    magick $CONT_DIR/overlay_png/"$output_file_name".png $resized_siren -geometry +$siren_x_end+$((y_offset + (box_height - siren_height) / 2)) -colorspace sRGB -composite $CONT_DIR/overlay_png/"$output_file_name".png

    # Text position
    text_x=$((siren_x_start + png_width + 10))
  else
    # Text position for other lines
    text_x=$((x_offset + 10))
  fi

  # Correct the vertical alignment for the text
  baseline_offset=$((text_height / 2))  # Adjust for baseline alignment
  text_y=$((y_offset + (box_height / 2) + baseline_offset - 5))

  magick $CONT_DIR/overlay_png/"$output_file_name".png -font $font -pointsize $font_size -fill $text_color \
    -annotate +$text_x+$text_y "$line" $CONT_DIR/overlay_png/"$output_file_name".png

  # Update y_offset for next line
  y_offset=$((y_offset + box_height - 3))
done

# Clean up
rm -f dimensions.txt $resized_siren


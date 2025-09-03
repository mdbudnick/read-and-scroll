#!/bin/bash

# ==============================================================================
#                      Image Resizing Script with Magick CLI
# ==============================================================================
# This script resizes a given input image to multiple specified dimensions
# using ImageMagick's 'magick' command. It also includes:
# - Automatic installation of ImageMagick on Linux (apt/dnf/yum) and macOS (brew).
# - Backup of existing output files to a separate directory.
# - Customizable input/output paths and resize dimensions.
#
# Usage:
# 1. Save this script as a .sh file (e.g., resize_images.sh).
# 2. Make it executable: chmod +x resize_images.sh
# 3. Customize the CONFIGURATION section below.
# 4. Run the script: ./resize_images.sh
#
# NOTE: Installation steps may require 'sudo' password.
# ==============================================================================

# =============================== CONFIGURATION ================================
# Path to your input image file (e.g., "./my_photo.jpg" or "/home/user/images/icon.png")
INPUT_IMAGE="./icon/rs-1024.png"

# Directory where the resized images will be saved
OUTPUT_DIR="./output_icons"

# Directory where existing output files will be moved before creating new ones
BACKUP_DIR="./backup_icons"

# Desired output sizes in pixels (e.g., (128 64 48 32 16) for 128x128, 64x64, etc.)
SIZES=(128 64 48 32 16)
# ==============================================================================

# --- Do not modify below this line ---

set -e # Exit immediately if a command exits with a non-zero status

echo "--- Image Resizing Script ---"

# Extract base name and extension from the input image file
FULL_INPUT_FILENAME=$(basename "$INPUT_IMAGE")
EXTENSION="${FULL_INPUT_FILENAME##*.}"
BASE_NAME="${FULL_INPUT_FILENAME%.*}"

echo "Input Image: $INPUT_IMAGE"
echo "Output Directory: $OUTPUT_DIR"
echo "Backup Directory: $BACKUP_DIR"
echo "Target Sizes: ${SIZES[@]}x${SIZES[@]}"
echo "-----------------------------"

# Check if input image exists
if [ ! -f "$INPUT_IMAGE" ]; then
    echo "Error: Input image '$INPUT_IMAGE' not found."
    exit 1
fi

# Function to check if a command exists
command_exists () {
    command -v "$1" &> /dev/null
}

# Check for ImageMagick 'magick' command and attempt to install if necessary
if ! command_exists magick; then
    echo "ImageMagick 'magick' command not found. Attempting to install..."
    OS=$(uname -s)

    if [ "$OS" == "Darwin" ]; then # macOS
        if ! command_exists brew; then
            echo "Error: Homebrew not found. Please install Homebrew (https://brew.sh/) first to proceed with automatic installation."
            exit 1
        fi
        echo "Installing ImageMagick via Homebrew (might require sudo/password)..."
        brew install imagemagick
    elif [ "$OS" == "Linux" ]; then # Linux
        if command_exists apt-get; then
            echo "Installing ImageMagick via apt-get (might require sudo/password)..."
            sudo apt-get update
            sudo apt-get install imagemagick -y
        elif command_exists dnf; then
            echo "Installing ImageMagick via dnf (might require sudo/password)..."
            sudo dnf install ImageMagick -y
        elif command_exists yum; then
            echo "Installing ImageMagick via yum (might require sudo/password)..."
            sudo yum install ImageMagick -y
        else
            echo "Error: No supported Linux package manager (apt-get, dnf, yum) found. Please install ImageMagick manually."
            exit 1
        fi
    else
        echo "Error: Unsupported operating system. Please install ImageMagick manually."
        exit 1
    fi

    # Final check after installation attempt
    if ! command_exists magick; then
        echo "Error: ImageMagick 'magick' command still not found after installation attempt. Please install it manually."
        exit 1
    fi
    echo "ImageMagick 'magick' command installed successfully."
else
    echo "ImageMagick 'magick' command found."
fi

# Backup existing files in the output directory
if [ -d "$OUTPUT_DIR" ]; then
    echo "Checking for existing files in '$OUTPUT_DIR' to backup..."
    mkdir -p "$BACKUP_DIR" # Ensure backup directory exists
    BACKED_UP=false
    for size in "${SIZES[@]}"; do
        FILE_TO_CHECK="${OUTPUT_DIR}/rs-${size}.${EXTENSION}"
        if [ -f "$FILE_TO_CHECK" ]; then
            echo "  - Backing up: $(basename "$FILE_TO_CHECK") to $BACKUP_DIR/"
            mv "$FILE_TO_CHECK" "$BACKUP_DIR/"
            BACKED_UP=true
        fi
    done
    if [ "$BACKED_UP" = true ]; then
        echo "Existing files moved to '$BACKUP_DIR'."
    else
        echo "No existing files to backup found in '$OUTPUT_DIR'."
    fi
fi

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"
echo "Output directory '$OUTPUT_DIR' ensured."

# Resize images
echo "Starting image resizing process..."
for size in "${SIZES[@]}"; do
    OUTPUT_FILE="${OUTPUT_DIR}/rs-${size}.${EXTENSION}"
    echo "  - Resizing to ${size}x${size} pixels and saving as: $(basename "$OUTPUT_FILE")"
    if magick "$INPUT_IMAGE" -resize "${size}x${size}" "$OUTPUT_FILE"; then
        echo "    Success: '$OUTPUT_FILE' created."
    else
        echo "    Error: Failed to create '$OUTPUT_FILE'."
    fi
done

echo "--- Script finished. All specified image sizes have been processed. ---"
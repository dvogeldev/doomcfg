#!/bin/bash
# Enhanced Browser Bookmark Capture Script
# Use this script to capture bookmarks from command line with multiple capture types

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$HOME/.config/doom/config.el"

# Check if config file exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo "Error: Doom config file not found at $CONFIG_FILE"
    exit 1
fi

# Function to show usage
show_usage() {
    echo "Enhanced Browser Bookmark Capture Script"
    echo "Usage: $0 <capture_type> <url> [title] [description] [category]"
    echo ""
    echo "Capture Types:"
    echo "  q     Quick capture (minimal prompts)"
    echo "  r     Rich capture (full metadata)"
    echo "  c     Categorized capture (with category selection)"
    echo ""
    echo "Examples:"
    echo "  $0 q 'https://example.com'"
    echo "  $0 r 'https://example.com' 'Example Site' 'An example site'"
    echo "  $0 c 'https://example.com' 'Example Site' 'An example site' 'Development'"
    exit 1
}

# Check arguments
if [ $# -lt 2 ]; then
    show_usage
fi

CAPTURE_TYPE="$1"
URL="$2"
TITLE="${3:-}"
DESCRIPTION="${4:-}"
CATEGORY="${5:-}"

# Generate default title if not provided
if [ -z "$TITLE" ]; then
    # Extract domain from URL as fallback
    TITLE=$(echo "$URL" | sed 's|https\?://||' | sed 's|/.*||' | tr -d '\n')
fi

# Map capture type to org-capture template
case "$CAPTURE_TYPE" in
    q)
        TEMPLATE="bq"
        ;;
    r)
        TEMPLATE="br"
        ;;
    c)
        TEMPLATE="bc"
        ;;
    *)
        echo "Invalid capture type: $CAPTURE_TYPE"
        show_usage
        ;;
esac

# Set environment variables for Emacs function
export BOOKMARK_URL="$URL"
export BOOKMARK_TITLE="$TITLE"
export BOOKMARK_DESC="$DESCRIPTION"
export BOOKMARK_CATEGORY="$CATEGORY"

# Launch Emacs and run the capture function
emacs --batch --eval "(progn
  (load-file \"$CONFIG_FILE\")
  (let ((org-capture-templates '((\"$TEMPLATE\" \"Bookmark\" entry
                                  (file \"~/org/bookmarks.org\")
                                  \"* %(my/bookmarks-suggest-title) :bookmark:\n  - URL: $URL\n  - Title: $TITLE\n  - Description: $DESCRIPTION\n  - Category: $CATEGORY\n  - Tags: %(my/bookmarks-suggest-tags-function)\n  - Captured: %U\n\" :empty-lines 1))))
    (org-capture nil \"$TEMPLATE\")))" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Bookmark captured: $TITLE"
else
    echo "❌ Error capturing bookmark: $TITLE"
    exit 1
fi
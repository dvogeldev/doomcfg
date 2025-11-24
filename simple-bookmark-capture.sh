#!/bin/bash
# Simple bookmark capture that works without Doom config dependencies

# Get parameters
CAPTURE_TYPE="${1:-q}"
URL="$2"
TITLE="${3:-$URL}"
DESCRIPTION="${4:-}"
CATEGORY="${5:-}"

# Validate input
if [ -z "$URL" ]; then
    echo "Usage: $0 <capture_type> <url> [title] [description] [category]"
    echo "Capture types: q (quick), r (rich), c (categorized)"
    exit 1
fi

# Create bookmarks file if it doesn't exist
BOOKMARKS_FILE="$HOME/org/bookmarks.org"
mkdir -p "$(dirname "$BOOKMARKS_FILE")"

if [ ! -f "$BOOKMARKS_FILE" ]; then
    cat > "$BOOKMARKS_FILE" << 'HEADER'
#+title: Web Bookmarks
#+filetags: :bookmarks:

* Reading List
** TODO
** DONE

* Tech Stack
** Languages
** Frameworks
** Tools & Utilities
** AI/ML

* Learning & Documentation
** Tutorials
** Reference
** Blogs & Articles

* Development
** Resources
** Snippets
** APIs

* Personal Projects
** Ideas
** Research

* Archive
** Old but useful
** Historical
HEADER
fi

# Generate entry based on capture type
TIMESTAMP=$(date "+%Y-%m-%d %a %H:%M")

case $CAPTURE_TYPE in
    "q"|"quick")
        # Quick capture - minimal info
        ENTRY="* $TITLE :bookmark:\n  [[$URL][$TITLE]]\n  - URL: $URL\n  - Description: $DESCRIPTION\n  - Tags: quick\n  - Captured: [$TIMESTAMP]\n\n"
        ;;
    "r"|"rich")
        # Rich capture - full metadata
        ENTRY="* $TITLE :bookmark:\n  [[$URL][$TITLE]]\n  - URL: $URL\n  - Description: $DESCRIPTION\n  - Category: $CATEGORY\n  - Tags: rich important\n  - Priority: Normal\n  - Status: To Review\n  - Captured: [$TIMESTAMP]\n  - Notes: %?\n\n"
        ;;
    "c"|"category")
        # Categorized capture
        if [ -z "$CATEGORY" ]; then
            CATEGORY="General"
        fi
        ENTRY="* $TITLE :bookmark:\n  [[$URL][$TITLE]]\n  - URL: $URL\n  - Description: $DESCRIPTION\n  - Category: $CATEGORY\n  - Tags: categorized\n  - Captured: [$TIMESTAMP]\n\n"
        ;;
    *)
        echo "Invalid capture type: $CAPTURE_TYPE"
        exit 1
        ;;
esac

# Append entry to bookmarks file
echo -e "$ENTRY" >> "$BOOKMARKS_FILE"

echo "✅ Bookmark captured successfully!"
echo "   Type: $CAPTURE_TYPE"
echo "   Title: $TITLE"
echo "   URL: $URL"
echo "   File: $BOOKMARKS_FILE"

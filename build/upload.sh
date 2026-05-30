#!/bin/bash
read -s -p "App-specific password: " ASP
echo
xcrun altool --upload-app \
  -f "/Users/gcarey/projects/reader/ruckus/build/export/App.ipa" \
  -t ios \
  -u "gcarey.tech@gmail.com" \
  -p "$ASP"

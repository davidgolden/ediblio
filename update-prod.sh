#!/bin/bash
while getopts ":i" option; do
   case $option in
      i)
         npm cache clean --force
         npm cache verify

         echo "installing dependencies"
         npm ci
   esac
done

echo "building next"
npm run build

echo "restarting process"
pm2 restart ediblio
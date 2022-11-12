#!/bin/bash
echo "installing dependencies"
npm ci --legacy-peer-deps

echo "building next"
npm run build

echo "restarting process"
pm2 restart server
pm2 restart ediblio
#!/bin/bash
echo "installing dependencies"
npm ci

echo "building next"
npm run build

echo "restarting process"
pm2 server restart

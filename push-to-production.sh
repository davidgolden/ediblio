#!/bin/bash

ssh root@144.126.212.244 'cd /var/www/ediblio; git pull; ./release-to-production.sh'

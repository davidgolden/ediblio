#!/bin/bash

ssh root@144.126.212.244 'cd /var/www/ediblio; git pull; ./update-prod.sh'

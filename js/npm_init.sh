#!bin/bash
##################################################
# this is a automated script to reconifgure both #
# the backend and the front end to the current   #
# given local ip address... 				     #
# auth - yair elad           				     #
##################################################
set -e
cd backend
npm install --legacy-peer-deps
cd ..

cd frontend
npm install --legacy-peer-deps
exit 0

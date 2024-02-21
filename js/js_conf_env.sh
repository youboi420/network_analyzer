#! bin/bash
##################################################
# this is a automated script to reconifgure both #
# the backend and the front end to the current   #
# given local ip address... 				     #
# auth - yair elad           				     #
##################################################
set -e
cd backend
npm run conf_ser_env http
cd ..

cd frontend
npm run conf_react_env
exit 0

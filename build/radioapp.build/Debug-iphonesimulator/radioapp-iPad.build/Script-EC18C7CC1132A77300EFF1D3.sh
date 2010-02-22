#!/bin/sh
make -C "${PHONEGAPLIB}"
echo cp ${PHONEGAPLIB}/javascripts/phonegap.js ${PROJECT_DIR}/www/phonegap.js
cp "${PHONEGAPLIB}/javascripts/phonegap.js" "${PROJECT_DIR}/www/phonegap.js"

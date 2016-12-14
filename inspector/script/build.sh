#!/bin/bash

GLOBIGNORE="*_panes.js"
cat src/*.js >script.js
GLOBIGNORE=""
cat src/*_panes.js >>script.js
cd serializer && gopherjs build -m && cd ..

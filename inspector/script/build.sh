#!/bin/sh

cat src/*.js >script.js
cd deserialize && gopherjs build -m && cd ..

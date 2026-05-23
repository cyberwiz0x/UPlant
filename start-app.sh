#!/bin/bash

cd "$(dirname "$0")" || exit 1
cd UPlant
npx expo start -c

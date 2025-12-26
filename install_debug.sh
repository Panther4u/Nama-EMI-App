#!/bin/bash
echo "Installing @capacitor/device and @capacitor/network..."
npm install --save @capacitor/device @capacitor/network
npm list @capacitor/device @capacitor/network
ls -d node_modules/@capacitor/device

#!/bin/bash
echo "Extracting SHA-256 Checksum..."
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep "SHA256:"
echo "---------------------------------------------------"
echo "PLEASE COPY THE LINE ABOVE (starting with SHA256:) AND PASTE IT INTO THE CHAT."

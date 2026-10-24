#!/bin/bash
cd "$(dirname "$0")"

echo "Deploying application..."

ssh www-data@jk.sk "rm -rf /var/www/sub.jk.sk/tools/*"
scp -r dist/* www-data@jk.sk:/var/www/sub.jk.sk/tools

echo ""
echo "Deployment complete."

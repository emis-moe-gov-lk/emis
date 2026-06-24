#!/bin/bash

# [ __HOW_TO_RUN__
# [ + Navigate to script directory
# [ + Change the permissions
# [ + Run the scripts
# [ 
# [ > chmod +x add-hosts.sh
# [ > sudo ./add-hosts.sh


# Hosts to add
HOSTS=(
    "124.43.177.235 services.app-uat.emis.moe.gov.lk"
    "124.43.177.235 idp.app-uat.emis.moe.gov.lk"
    "124.43.177.235 apim.app-uat.emis.moe.gov.lk"
)

HOSTS_FILE="/etc/hosts"

# Must run as root
if [[ $EUID -ne 0 ]]; then
    echo "Run this script as root: sudo $0"
    exit 1
fi

echo "Adding EMIS UAT hosts to $HOSTS_FILE..."

for entry in "${HOSTS[@]}"; do
    hostname=$(echo "$entry" | awk '{print $2}')

    if grep -qF "$hostname" "$HOSTS_FILE"; then
        echo "  [SKIP] $hostname already exists"
    else
        echo "$entry" >> "$HOSTS_FILE"
        echo "  [ADDED] $entry"
    fi
done

echo "Done."

## [Docker Hub Image Pull Timeout]

**Date:** 2026-04-05
**Environment:** UAT-TEST-ENV / Ubuntu / Docker Compose

###  Symptom
> When pulling a image from docker hub ...
> `Error response from daemon: Get "https://index.docker.io/v1/search?q=XXXXXXXXX&n=25": dial tcp: lookup index.docker.io on 127.0.0.53:53: read udp 127.0.0.1:45271->127.0.0.53:53: i/o timeout `

###  Cause
System Level DNS Issue. Docker daemon cant resolve docker hub from systemd-resolved.

###  Resolution
1. Restart the resolver: `sudo systemctl restart systemd-resolved`
2. Check again if pull works.
3. IF Persistent, check if google dns server can be reached.
2. If persistent, update `/etc/docker/daemon.json` with Google DNS (`8.8.8.8`).

###  Prevention
Add regular system restarts & relavant services like resolved, docker.service etc. restart via cron jobs or startup scripts. 

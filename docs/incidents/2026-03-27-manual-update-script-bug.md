## [Manual Update Script not pulling the latest image when tags overlap]

**Date:** 2026-03-27  
**Script:** [Script](/scripts/update-frontend-backend.sh)  
**Environment:** UAT-TEST-ENV / Ubuntu / Docker Compose  

###  Symptom
> When a new image is pulled which has been tagged by previous tag newer image is skipped 

###  Cause
> When a overlapping image tag is given docker engine gets the image from its loca image list  instead of pulling.

###  Resolution
Explicilty Pull Image from Docker Hub
```bash
# Pull the latest versions  in compose from DHub
docker compose pull frontend backend
```

###  Prevention
Update the Script.
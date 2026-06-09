## Temporary workaround
Run 

````
composer install --ignore-platform-req=ext-gd
`````
flag to skip the platform check:

#### Option 3: Update the lock file

Run 

````
composer update 
``````
to regenerate the lock file, which may find versions compatible with your current platform setup.
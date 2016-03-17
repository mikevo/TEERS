## Doc

This documentation is written for CentOS 7.

### Install
1. First, setup a fresh CentOS 7 minimal
2. add the EPEL repo
  ```
  yum install epel-release
  ```

3. Install the [prerequirements for MEAN.JS](http://meanjs.org/docs/0.3.x/#getting-started)
  * Node.js and npm and grunt-cli
    ```
    yum install npm
    npm install -g bower
    yum install nodejs-grunt-cli
    yum install git
    ```

  * MongoDB
    ```
    yum install mongodb-server
    yum install nodejs-mongodb
    systemctl enable mongod.service
    systemctl start mongod.service
    ```
  * Redis
    ```
    yum install redis
    systemctl enable redis.service
    systemctl start redis.service
    ```
  * NGINX
    ```
    yum install nginx
    systemctl enable nginx.service
    ```

4. Get TEERS code and setup service
  ```
  mkdir -p /var/www/
  cd /var/www/
  wget https://github.com/mikevo/TEERS/archive/master.zip
  unzip master.zip
  mv TEERS-master/ teers
  ```
  
  Create config.json in '/var/www/teers' where you have to adjust the URLs and credentials in the 'recSys' property according to your recommender system
  ```
  {
    "spotify": {
      "url": "https://api.spotify.com/v1/tracks/",
      "cache": {
        "enable": true,
        "expireTime": 3600
      },
      "log": {
        "enable": false
      },
      "regex": "^spotify:track:([0-9a-zA-Z]+)$",
      "searchUrl": "https://api.spotify.com/v1/search?type=track&q=",
      "maxNumOfSearchResults": 10
    },
    "recSys": {
      "url": "http://138.232.66.120:18650/api/v0.1/getTrackRecommendations",
      "defaultContext": "NAME OF DEFAULT CONTEXT",
      "user": "YOUR USER",
      "numOfRecs": 10,
      "recType": "tracks",
      "password": "USERPASSWORD",
      "contentType": "application/json",
      "contextsUrl": "http://138.232.66.120:18650/api/v0.1/getContexts",
      "deleteUrl": "http://138.232.66.120:18650/api/v0.1/deleteProfile"
    },
    "ratingThreshold": 4,
    "profile": {
      "minSize": 3,
      "wantedSize": 10,
      "starRating": true,
      "starMaxRating": 5
    },
    "views": {
      "tracks": {
        "display": 6
      }
    }
  }
  ```

  ```
  useradd -mrU srv-node-teers
  npm install --production
  chown -R srv-node-teers: .
  ```

  Create a service file for the application, in '/etc/systemd/system/node-teers.service'
  ```
  [Service]
  ExecStart=/bin/node /var/www/teers/server.js
  Restart=always
  StandardOutput=syslog
  StandardError=syslog
  SyslogIdentifier=node-teers
  User=srv-node-teers
  Group=srv-node-teers
  WorkingDirectory=/var/www/teers/
  Environment=NODE_ENV=production

  [Install]
  WantedBy=multi-user.target
  ```

  Start service
  ```
  systemctl enable node-teers
  systemctl start node-teers
  ```

5. Setup NGINX as reverse proxy
  * Change config
    ```
    vim /etc/nginx/nginx.conf
    ```

    Place this in the server block:
    ```
    location / {
        proxy_pass http://localhost:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    ```

  * Start NGINX and config SELinux
  ```
  systemctl start nginx.service
  setsebool httpd_can_network_connect 1 -P
  ```

5. Add firewall rules
```
firewall-cmd --zone=public --add-port=80/tcp --permanent
firewall-cmd --zone=public --add-port=8080/tcp --permanent
firewall-cmd --reload
```

### Change questionnaire for registration
The HTML-Template of the optional part of the questionnaire is located in 'public/modules/users/views/directive-templates/optional-questionnaire.client.view.html'. Therefore, the questionnaire can be changed by simply editing this template. The 'data' variable in 'data-ng-model' is linked with the 'questionnaire' property stored for each user object in the database. Further,

```
{{ 'GENDER' | translate }}
```

loads the content of GENDER contained in the internationalization file. See 'public/i18n/'

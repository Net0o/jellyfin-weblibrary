# jellyfin-weblibrary
<h1><b>Website based library of your Jellyfin Movies / Series / New cards</b></h1>

<img width="1458" height="823" alt="image" src="https://github.com/user-attachments/assets/5fac61af-2722-48a4-a89d-4d85015b8278" />

<h2>Comes with alphabetical search / search field / genre selection, IMDB & CSFD buttons</h2>

Jellyfin-weblibrary is using Jellyfin & IMDB API key which you have to enter in the .env file

<h3>Configuration steps:</h3>

<h5>1. Backend configuration (.env)

download all files, put them in respective folders and modify the .env file

nano /home/username/jellyfin-libr-backend/.env

2. Install dependencies (once)

npm install

3. Test backend manually
   
node server.js

You should see something like:
Jellyfin backend running on port 3002

Test in browser:

http://hostip:3002/api/items

If you see JSON → backend works ✅

Stop it:
CTRL + C

4. Run backend as a service (recommended)
   
Create systemd service:

sudo nano /etc/systemd/system/jellyfin-moviedb.service

Paste:

<h6>[Unit]

Description=Jellyfin Movie Backend

After=network.target

[Service]

Type=simple

User=username

WorkingDirectory=/home/username/jellyfin-libr-backend

ExecStart=/usr/bin/node server.js

Restart=always

Environment=NODE_ENV=production


[Install]

WantedBy=multi-user.target </h6>

5. Enable & start:

sudo systemctl daemon-reexec

sudo systemctl daemon-reload

sudo systemctl enable jellyfin-moviedb

sudo systemctl start jellyfin-moviedb

Check:

sudo systemctl status jellyfin-moviedb

6. Access the site ✅
Open in browser:
http://YOUR_SERVER_IP/moviedb/ </h5>

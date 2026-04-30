# jellyfin-weblibrary

<img width="1458" height="823" alt="image" src="https://github.com/user-attachments/assets/5fac61af-2722-48a4-a89d-4d85015b8278" />


Website based library of your jellyfin movies / series, just to check, what you already have.

Jellyfin-weblibrary is using jellyfin API key which must be set along with the instance in the .env file


1. Backend configuration (.env)

download the files, put in respective folders and modify the .env file

nano /home/dietpi/jellyfin-libr-backend/.env

2. Install dependencies (once)

npm install

3. Test backend manually
   
node server.js

You should see something like:

Jellyfin backend running on port 3002

Test in browser:

http://localhost:3002/api/movies

If you see JSON → backend works ✅

Stop it:
CTRL + C

4. Run backend as a service (recommended)
   
Create systemd service:

sudo nano /etc/systemd/system/jellyfin-moviedb.service

Paste:

[Unit]

Description=Jellyfin Movie Backend

After=network.target

[Service]

Type=simple

User=dietpi

WorkingDirectory=/home/dietpi/jellyfin-libr-backend

ExecStart=/usr/bin/node server.js

Restart=always

Environment=NODE_ENV=production


[Install]

WantedBy=multi-user.target


5. Enable & start:

sudo systemctl daemon-reexec

sudo systemctl daemon-reload

sudo systemctl enable jellyfin-moviedb

sudo systemctl start jellyfin-moviedb

Check:

sudo systemctl status jellyfin-moviedb

6. Access the site ✅
   
Open in browser:

http://YOUR_SERVER_IP/moviedb/

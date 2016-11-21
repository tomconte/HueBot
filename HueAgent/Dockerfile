FROM hypriot/rpi-node:argon

# Add package.json and install modules
ADD package.json .
RUN npm install

# Add the rest of the app
ADD . .

CMD [ "node", "app.js" ]

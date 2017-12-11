const Docker = require('dockerode');
const fs = require('fs');
const uuid = require('uuid/v4')
const path = require('path');

const docker = new Docker();

var volumePath = path.resolve('boxes', uuid());
fs.mkdirSync(volumePath, 0o755);

docker.createContainer({
  "Image": 'alpine',
  "Tty": false,
  Cmd: [ "/bin/sh", "-c", "while true; do sleep 30; done;" ],
  "Env": [],
  "Volumes": {
    '/fulcrum': {}
  },
  "HostConfig": {
    "Binds":[volumePath+":/fulcrum"],
    "PortBindings": { "22/tcp": [{ "HostPort": "1122" }] }
  },
  "ExposedPorts": { "22/tcp": {} },

}, (err, container)=>{
  container.start({}, (err, data)=>{
    console.log("Started", container.id);
    console.log("==> mounted", volumePath);
  });
});

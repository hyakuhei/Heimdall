const fs = require('fs');
const path = require('path');
const uuid = require('uuid/v4');
const portfinder = require('portfinder');

const Docker = require('dockerode');
const docker = new Docker();

portfinder.basePort = 1122;

//We can be confident that this will run and complete before the fs.watch stuff starts going on (creating containers etc)

var user = 'op9'

var target_id = "b7cc65ef8a01";
var jump_id = "";

var user = 'op9';
var labels = {
  "fulcrum-type":"jumpbox",
  "fulcrum-user":"op9"
};



//Setup our watcher to react when the server updates our files
fs.watch(path.resolve('boxes'), {persistent:true}, (eventType, filename) => {
  console.log('EventType:', eventType);
  console.log('Filename:', filename);
  if(filename === 'box.pub'){
    console.log("got a public key, signing.")
    //TODO: Something smart around the -I and the -n
    //ssh-keygen -s ../host_ca -I $CNAME -h -n $HOSTNAME -V +1w ./ssh_host_rsa_key.pub
    //HOSTNAME=test.server.example.com
    //CNAME=bs-server
    exec('ssh-keygen -s ../user_ca -I op9 -h -n op9 -V +1w '+path.resolve('boxes',filename), (err, stdout, stderr) => {
      if (err) {
    // node couldn't execute the command
      console.err("Node couldn't make that work");
    return;
  }

  // the *entire* stdout and stderr (buffered)
  console.log(`stdout: ${stdout}`);
  console.log(`stderr: ${stderr}`);
});
  }
});

//load our CA's
var user_ca_pubkey = fs.readFileSync('../user_ca.pub', 'utf8');

var env = [
  'USER=op9',
];

var volumePath = path.resolve('boxes', uuid());
fs.mkdirSync(volumePath, 0o755);
// Start container
// Container generates private key (run.sh)
// Container "publishes" public key to volume
// Fulcrum spots the public key and signs it, placing certificate in the volume
// Fulcrum execs into container and triggers the second script
// TODO: roll in 2FA
portfinder.getPort((err,port)=>{
  if (err) console.log(err);
  console.log(port)
  docker.createContainer({
    "Image": 'jumpbox',
    "Tty": false,
    //Cmd: [ "/bin/bash", "-c", "while true; do sleep 30; done;" ]
    "Cmd": [],
    "Env": env,
    "Volumes": {
      '/fulcrum': {}
    },
    "HostConfig": {
      'Binds':[volumePath+":/fulcrum"],
      "PortBindings": { "22/tcp": [{ "HostPort": ""+port }] }
    },
    "Labels": labels,
    "ExposedPorts": {'22/tcp': {} },

  }, (err, container)=>{
    container.start({}, (err, data)=>{
      //runExec(container);
      console.log("Started container:", container.id);
      console.log("Fulcrum data volume mounted to:", volumePath);
      console.log(container);
      console.log(err);
    });
  });
});

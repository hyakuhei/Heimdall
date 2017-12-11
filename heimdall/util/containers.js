const Docker = require('dockerode');
const docker = new Docker();//TODO: Some sensible docker configuration

function startBastion(opts, cb){
  docker.createContainer({
    "Image": "alpine",
    "Tty": false,
    "Cmd": [ "/bin/sh", "-c", "while true; do sleep 30; done;" ],
    "HostConfig": {
      "PortBindings": {"22/tcp":[{}]} //Docker should assign a random hostport
    },
    "Labels":{
      "heimdall.type":"bastion",
      "heimdall.displayName":opts.displayName,
      "heimdall.userId":opts.userId,
      "heimdall.typeVersion":'1'
    },
    "ExposedPorts":{"22/tcp": {} }
  }, (err, container)=>{
    container.start({}, (err,data)=>{
      console.log(`Start called on container: ${container.id}`);
      console.log(err);
      if (err){
        cb(err,null);
      }
      cb(null, container);
    });
  });
};

var opts = {"userId":'999',"displayName":"DAVE", "image":'alpine'};

if(require.main === module){
  startBastion(opts,(err,data)=>{
    if (err){
      console.log(`Error starting bastion with opts: ${opts}`);
    }else{
      console.log(data);
    }
  });
}

module.exports = {'startBastion': startBastion};

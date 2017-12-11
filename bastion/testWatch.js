const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

fs.watch(path.resolve('boxes'), {persistent:true}, (eventType, filename) => {
  console.log('EventType:', eventType);
  console.log('Filename:', filename);
  if(filename === 'id_rsa.pub'){
    console.log("got a public key, signing.")
    //TODO: Something smart around the -I and the -n
    //ssh-keygen -s ../host_ca -I $CNAME -h -n $HOSTNAME -V +1w ./ssh_host_rsa_key.pub
    //HOSTNAME=test.server.example.com
    //CNAME=bs-server
    exec('ssh-keygen -s ../user_ca -I op9 -h -n op9 -V +1w '+path.resolve('boxes',filename), (err, stdout, stderr) => {
      if (err) {
    // node couldn't execute the command
        console.err("Error execing ssh-keygen to sign certificates");
        return;
      }

      // the *entire* stdout and stderr (buffered)
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
    });
  }
});

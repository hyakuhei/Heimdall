#!/bin/sh -eu

# generate SSH host key (not done by default on Alpine), and actually if we'd do it when
# building the Docker image, that'd be a huge security implication (leak the host private key)
if [ ! -f /etc/ssh/ssh_host_rsa_key ]; then
	ssh-keygen -f /etc/ssh/ssh_host_rsa_key -N '' -b 4096 -t rsa
	export WD=$PWD
	cd /etc/ssh/
	ssh-keygen -A
	cd $WD
fi

adduser -s /bin/sh -D $USER
mkdir /home/$USER/.ssh

# Put the key from the user in our authorized keys so the user can log into the jumpbox
echo "Waiting for user_supplied_key.pub"
while [ ! -f /fulcrum/user_supplied_key.pub ]
do
  sleep 1
done
echo "Found user_supplied_key.pub"
cat /fulcrum/user_supplied_key.pub >> /home/$USER/.ssh/authorized_keys

echo "Waiting for host_ca.pub"
while [ ! -f /fulcrum/host_ca.pub ]
do
  sleep 1
done
echo "Found host_ca.pub"

echo "@cert-authority *.example.com $(cat /fulcrum/host_ca.pub)" > /home/$USER/.ssh/known_hosts

# Generate private key that will be used for forward connection
ssh-keygen -b 2048 -t rsa -f /home/$USER/.ssh/id_rsa -q -N ''

# Copy our generated public key into the /fulcrum volume so Fulcrum can sign it
cp /home/$USER/.ssh/id_rsa.pub /fulcrum/box.pub

#Set ownerships
chown $USER /home/$USER/
chown $USER /home/$USER/.ssh/*
chmod 644 /home/$USER/.ssh/authorized_keys
chmod 755 /home/$USER/.ssh/

#Set the password to some unknown value
PASWD="$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 8 | head -n 1)"
echo $USER:$PASWD | chpasswd

#Setup 2FA and SSH Private key (for connecting forwards)
cd /home/$USER
su - $USER -c "google-authenticator -t -d -u -f -w 3"
cd $WD
echo -e "auth required pam_google_authenticator.so" >> /etc/pam.d/base-auth

# This basically sleeps us until the box-ca.pub appears in the directory
echo "Waiting for box-cert.pub"
while [ ! -f /fulcrum/box-cert.pub ]
do
  sleep 1
done
echo "Found box-cert.pub"

cp /fulcrum/box-cert.pub /home/$USER/.ssh/id_rsa-cert.pub

exec /usr/sbin/sshd -D

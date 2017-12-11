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

# This allows our end user to log into the Jumpbox
adduser -s /bin/sh -D $USER
mkdir /home/$USER/.ssh

echo "$SSH_PUBKEY" > /home/$USER/.ssh/authorized_keys
chown $USER /home/$USER/
chown $USER /home/$USER/.ssh/*
chmod 644 /home/$USER/.ssh/authorized_keys
chmod 755 /home/$USER/.ssh/

#Set the password to some unknown value
PASWD="$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 8 | head -n 1)"
echo $USER:$PASWD | chpasswd

#Setup 2FA
cd /home/$USER
su - $USER -c "google-authenticator -t -d -u -f -w 3"
cd $WD
echo -e "auth required pam_google_authenticator.so" >> /etc/pam.d/base-auth

#Update the hosts file of the jump box with the host we're going to connect to
echo "$UPDATE_HOSTS" >> /etc/hosts

#Place the host CA pubkey so that we can authenticate servers we connect to
echo "@cert-authority *.example.com $HOST_CA_PUBKEY" > /home/$USER/.ssh/known_hosts

#Use the SSH Keys and Certificate that have been created for the JumpAuth to connect onwards
echo "$SSH_FWD_PUBKEY" > /home/$USER/.ssh/id_rsa.pub
echo "$SSH_FWD_PRIVKEY" > /home/$USER/.ssh/id_rsa
echo "$SSH_FWD_CERTIFICATE" > /home/$USER/.ssh/id_rsa-cert.pub

exec /usr/sbin/sshd -D

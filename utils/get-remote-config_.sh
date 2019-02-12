#!/bin/bash
set -e
usage() {
	echo "Usage: $0 [-d <configs_directory>] -t [tmp_path] -p [ip_orderer_host] -k [key_path] -g [list_of_orgs] -c [list_of_channels]" 1>&2
	exit 1
}
while getopts ":d:t:p:k:g:c:" o; do
	case "${o}" in
	d)
		d=${OPTARG}
		;;
	t)
		t=${OPTARG}
		;;
	p)
		p=${OPTARG}
		;;
	k)
		k=${OPTARG}
		;;
	g)
		g=${OPTARG}
		;;
	c)
		c=${OPTARG}
		;;
	*)
		usage
		;;
	esac
done
shift $((OPTIND - 1))
if [ -z "${d}" ] || [ -z "${t}" ] || [ -z "${p}" ] || [ -z "${k}" ] || [ -z "${g}" ] || [ -z "${c}" ]; then
	usage
fi
IP=${p}
CONFIG_PATH=${d}
TMP_CONFIG_PATH=${t}
KEY_PATH=${k}
ORGS=${g}
mkdir -p ${CONFIG_PATH}/crypto-config
mkdir -p ${CONFIG_PATH}/fabric-network-config
rm -rf ${CONFIG_PATH}/crypto-config/*
rm -rf ${CONFIG_PATH}/fabric-network-config/*
mkdir -p ${TMP_CONFIG_PATH}
rm -rf ${TMP_CONFIG_PATH}/*
rm -rf /tmp/hfc-cvs
rm -rf /tmp/hfc-kvs
echo "get from server ${IP}... to tmp directory"
scp -i ${k} -r baotq@${IP}:/home/baotq/Study/Hyperledger-Fabric/fabric-samples/first-network/crypto-config/* ${TMP_CONFIG_PATH}/
echo "done..."
sleep 2
echo "copy all material in {TMP_CONFIG_PATH} to {CONFIG_PATH}/crypto-config folder"
cp -R ${TMP_CONFIG_PATH}/* ${CONFIG_PATH}/crypto-config/

# for org in $ORGS; do
# 	if [ -f ${CONFIG_PATH}/crypto-config/orgs/${org}/admin/tls/client.key ]; then
# 		mv ${CONFIG_PATH}/crypto-config/orgs/${org}/admin/tls/client.key ${CONFIG_PATH}/crypto-config/orgs/${org}/admin/tls/server.key
# 	fi
# 	if [ -f ${CONFIG_PATH}/crypto-config/orgs/${org}/admin/tls/client.crt ]; then
# 		mv ${CONFIG_PATH}/crypto-config/orgs/${org}/admin/tls/client.crt ${CONFIG_PATH}/crypto-config/orgs/${org}/admin/tls/server.crt
# 	fi
# done

if [ -f ${CONFIG_PATH}/fabric-network-config/connection-profile.yaml ]; then
	rm -f ${CONFIG_PATH}/fabric-network-config/connection-profile.yaml
fi

# create ${org}-profile.yaml" for each org:
for org in $ORGS; do
  if [ "${org}" != "Orderer" ]; then
  orgLowerCase="${org,,}"
	echo "# The name of connection profile
name: \"${orgLowerCase} Client\"
version: \"1.0\"

# Client section is for NodeJS SDK. 
client:
  organization: ${orgLowerCase} # The org that this app instance belong to
  # set connection timeouts for the peer and orderer for the client
  connection:
    timeout:
      peer:
        # the timeout in seconds to be used on requests to a peer,
        # for example sendTransactionProposal
        endorser: 120
        # the timeout in seconds to be used by applications when waiting for an
        # event to occur. This time should be used in a javascript timer object
        # that will cancel the event registration with the event hub instance.
        eventHub: 60
        # the timeout in seconds to be used when setting up the connection
        # with the peers event hub. If the peer does not acknowledge the
        # connection within the time, the application will be notified over the
        # error callback if provided.
        eventReg: 30
      # the timeout in seconds to be used on request to the orderer,
      # for example
      orderer: 30
  credentialStore: # KVS of Client instance
    path: \"/tmp/hfc-kvs/${orgLowerCase}\"
    cryptoStore: # Cryptosuite store of Client instance
      path: \"/tmp/hfc-cvs/${orgLowerCase}\"
" >>${CONFIG_PATH}/fabric-network-config/${orgLowerCase}-profile.yaml
  fi
done

# Build connection-profile.yaml
echo 'name: "first-network network"
description: "The network to be used to connect to first-network running under docker for studying"
version: "1.0"
# Optinal. But most app would have this so that channle objects can be constructed based on this section.
channels:' >>${CONFIG_PATH}/fabric-network-config/connection-profile.yaml 
for channel in $c; do
	echo "
  ${channel}: # name of channel
    orderers:
      - orderer.example.com
    peers:" >>${CONFIG_PATH}/fabric-network-config/connection-profile.yaml
	for org in $ORGS; do
    if [ "${org}" != "Orderer" ]; then      
      orgLowerCase="${org,,}"
			echo "      peer0.${orgLowerCase}.example.com:
        endorsingPeer: true
        chaincodeQuery: true
        ledgerQuery: true
        eventSource: true" >>${CONFIG_PATH}/fabric-network-config/connection-profile.yaml
		fi
	done
done

echo "
#
# list of participating organizations in this network
#
organizations:" >>${CONFIG_PATH}/fabric-network-config/connection-profile.yaml
for org in $ORGS; do
	if [ "${org}" != "Orderer" ]; then
    orgLowerCase="${org,,}"
		echo "  ${orgLowerCase}:
    mspid: ${orgLowerCase}MSP
    peers: 
      - peer0.${orgLowerCase}.example.com
      - peer1.${orgLowerCase}.example.com
    certificateAuthorities:
      - rca.${orgLowerCase}.example.com
    adminPrivateKey:
      path: configs/crypto-config/peerOrganizations/${orgLowerCase}.example.com/users/Admin@${orgLowerCase}.example.com/msp/keystore/ADMIN_PRIVATE_KEY
    signedCert:
      path: configs/crypto-config/peerOrganizations/${orgLowerCase}.example.com/users/Admin@${orgLowerCase}.example.com/msp/signcerts/Admin@${orgLowerCase}.example.com-cert.pem" >>${CONFIG_PATH}/fabric-network-config/connection-profile.yaml
	fi  
done

echo "
orderers:
  orderer.example.com:
    url: grpcs://orderer.example.com:7050
    grpcOptions:
      ssl-target-name-override: orderer.example.com
      grpc-keepalive-timeout-ms: 3000
      grpc.keepalive_time_ms: 360000
      grpc-max-send-message-length: 10485760
      grpc-max-receive-message-length: 10485760
    tlsCACerts:
      path: configs/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
peers:" >>${CONFIG_PATH}/fabric-network-config/connection-profile.yaml
for org in $ORGS; do
	if [ "${org}" != "Orderer" ]; then
    orgLowerCase="${org,,}"
		echo "  peer0.${orgLowerCase}.example.com:
    url: grpcs://peer0.${orgLowerCase}.example.com:7051
    eventUrl: grpcs://peer0.${orgLowerCase}.example.com:7053
    grpcOptions:
      ssl-target-name-override: peer0.${orgLowerCase}.example.com
      grpc.keepalive_time_ms: 600000
    tlsCACerts:
      path: configs/crypto-config/peerOrganizations/${orgLowerCase}.example.com/peers/peer0.${orgLowerCase}.example.com/msp/tlscacerts/tlsca.${orgLowerCase}.example.com-cert.pem" >>${CONFIG_PATH}/fabric-network-config/connection-profile.yaml

    echo "  peer1.${orgLowerCase}.example.com:
    url: grpcs://peer1.${orgLowerCase}.example.com:7051
    eventUrl: grpcs://peer1.${orgLowerCase}.example.com:7053
    grpcOptions:
      ssl-target-name-override: peer1.${orgLowerCase}.example.com
      grpc.keepalive_time_ms: 600000
    tlsCACerts:
      path: configs/crypto-config/peerOrganizations/${orgLowerCase}.example.com/peers/peer1.${orgLowerCase}.example.com/msp/tlscacerts/tlsca.${orgLowerCase}.example.com-cert.pem" >>${CONFIG_PATH}/fabric-network-config/connection-profile.yaml
	fi
done

echo "
certificateAuthorities:" >>${CONFIG_PATH}/fabric-network-config/connection-profile.yaml
for org in $ORGS; do
  orgLowerCase="${org,,}"
  if [ "${org}" != "Orderer" ]; then
	echo "  rca.${orgLowerCase}.example.com:
    url: https://rca.${orgLowerCase}.example.com:7054
    httpOptions:
      verify: false
    tlsCACerts:
      path: configs/crypto-config/peerOrganizations/${orgLowerCase}.example.com/ca/ca.${orgLowerCase}.example.com-cert.pem
    registrar:
      - enrollId: admin
        enrollSecret: adminpw
    caName: rca.${orgLowerCase}.example.com" >>${CONFIG_PATH}/fabric-network-config/connection-profile.yaml
  fi  
done


echo "Rename Org's Admins private keys to ADMIN_PRIVATE_KEY"
for org in $ORGS; do
  orgLowerCase="${org,,}"  
  if [ "${org}" != "Orderer" ]; then
    CURRENT_DIR=$PWD
    cd configs/crypto-config/peerOrganizations/${orgLowerCase}.example.com/users/Admin@${orgLowerCase}.example.com/msp/keystore
    PRIV_KEY=$(ls *_sk)
    cd "$CURRENT_DIR"
    cp configs/crypto-config/peerOrganizations/${orgLowerCase}.example.com/users/Admin@${orgLowerCase}.example.com/msp/keystore/${PRIV_KEY} configs/crypto-config/peerOrganizations/${orgLowerCase}.example.com/users/Admin@${orgLowerCase}.example.com/msp/keystore/ADMIN_PRIVATE_KEY
  fi  
done


# To run at local: ./utils/get-remote-config.sh -d ./configs -t /tmp/test-net -p localhost -k ~/Working/Deevo/pem/dev-full-rights.pem -g "Orderer Org1 Org2" -c "aimthaichannel"

# To run at remote: ./utils/get-remote-config.sh -d /opt/gopath/src/github.com/deevotech/sc-api.deevo.io/configs -t /tmp/tempplate -p 18.136.126.89 -k /home/datlv/Documents/deevo/key/dev-full-rights.pem -g "org0 org1 org2 org3 org4 org5" -c "deevochannel aimthaichannel"

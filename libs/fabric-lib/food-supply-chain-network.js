var fsx = require('fs-extra');
var fabricClient = require('./fabric-client');
var constants = require('../../utils/constants.js');
//var enrollAdmin = require('../../utils/enrollAdmin');

/**
* A network to wrap the connection/client object to interact with HLF network. 	 	 
*/
class FoodSupplyChainNetwork {

  constructor(userName, password) {    
    this.currentUser;
    this.issuer;
    this.userName = userName;
    this.userPW = password;
    this.connection = fabricClient;
  }

  /**
	* Utility method to delete the mutual tls client material used 	 	 
	*/
  _cleanUpTLSKeys()
  {
    return Promise.resolve();
    
    let client_config = this.connection.getClientConfig();
    let store_path = client_config.credentialStore.path;
    let crypto_path = client_config.credentialStore.cryptoStore.path;
    fsx.removeSync(crypto_path);
    fsx.copySync(store_path,crypto_path);
  }

  /**
	* Get and setup TLS mutual authentication for endpoints for this connection
	*/
  _setUpTLSKeys()
  {
    return this.connection.initCredentialStores().then(() => {
        
        var caService = this.connection.getCertificateAuthority();

        let request = {
          enrollmentID: constants.OrgAdmin.Username,
          enrollmentSecret: constants.OrgAdmin.Password,
          profile: 'tls'
        };

        return caService.enroll(request)
        .then((enrollment) => {      
          let key = enrollment.key.toBytes(); // this key will be persistenced on cvs store.
          let cert = enrollment.certificate;
          this.connection.setTlsClientCertAndKey(cert, key);
        }).catch((err) => {
          console.error('Failed to tls-enroll admin-org1: ' + err);  
        });
    });
}

  /** 
  * Initializes the channel object with the Membership Service Providers (MSPs). The channel's
	* MSPs are critical in providing applications the ability to validate certificates and verify
  * signatures in messages received from the fabric backend.
  */
  _initChannelMSP()
  {
      var channel = this.connection.getChannel(constants.ChannelName);
      return channel.initialize();
  }

  /**
	* Get and setup TLS mutual authentication for endpoints for this connection
	*/
  _enroll(org)
  {
    var caService;
    let username = `admin-${org}`;
    let password = `admin-${org}pw`;
    console.log(`Enroll with username ${username}`);
    this.connection.loadFromConfig(`configs/fabric-network-config/${org}-profile.yaml`);

    // init the storages for client's state and cryptosuite state based on connection profile configuration 
    return this.connection.initCredentialStores()
        .then(() => {
            // tls-enrollment
            caService = this.connection.getCertificateAuthority();
            return caService.enroll({
                enrollmentID: username,
                enrollmentSecret: password,
                profile: 'tls',
                attr_reqs: [
                    { name: "hf.Registrar.Roles" },
                    { name: "hf.Registrar.Attributes" }
                ]
            }).then((enrollment) => {
                console.log('Successfully called the CertificateAuthority to get the TLS material');
                let key = enrollment.key.toBytes();
                let cert = enrollment.certificate;

                // set the material on the client to be used when building endpoints for the user
                this.connection.setTlsClientCertAndKey(cert, key);
                return this.connection.setUserContext({ username: username, password: password });
            })
        })
  }

  /**
	 * Init TLS material and usercontext for used by network.
   * Just use init if we wish to have one shared crypto material
	 */
  init() {
    this._cleanUpTLSKeys();
    this._setUpTLSKeys()
    .then(() => {
        this._initChannelMSP()
        .then(() => {    
            var isAdmin = false;
            if (this.userName == constants.OrgAdmin.Username) {
              isAdmin = true;
            }     
            // Restore the state of user by the given name from key value store 
            // and set user context for this connection.
            return this.connection.getUserContext(this.userName, true)
            .then((user) => {
              this.currentUser = user;
              return user;
            })
        })
    });
  }

  invoke(fcn, data) {
    // In the futurre, we will change "org1" to any orgs to make load balancer
    // return this._enroll("org1").then(() => {
    //   var dataAsBytes = new Buffer(JSON.stringify(data));		
    //   var tx_id = this.connection.newTransactionID();
    //   var requestData = {
    //     chaincodeId: constants.ChainCodeId,
    //     fcn: fcn,
    //     args: [dataAsBytes],
    //     txId: tx_id
    //   };
    //   return this.connection.submitTransaction(requestData);
    // })    

    var dataAsBytes = new Buffer(JSON.stringify(data));		
      var tx_id = this.connection.newTransactionID();
      var requestData = {
        chaincodeId: constants.ChainCodeId,
        fcn: fcn,
        args: [dataAsBytes],
        txId: tx_id
      };
      return this.connection.submitTransaction(requestData);
  }

  query(fcn, id, objectType) {
    
    // In the futurre, we will change "org1" to any orgs to make load balancer
    return this._enroll("org1").then(() => {
      let localArgs = [];
      if(id) localArgs.push(id);
      if(objectType) localArgs.push(objectType);
  
      var tx_id = this.connection.newTransactionID();
      var requestData = {
        chaincodeId: constants.ChainCodeId,
        fcn: fcn,
        args: localArgs,
        txId: tx_id
      };
      return this.connection.query(requestData);
    })
  }
}

// for this mvp, use admin-org1 as shared user for all users.
const sharedUserName = constants.OrgAdmin.Username;
var foodSupplyChainNetwork = new FoodSupplyChainNetwork(sharedUserName);
foodSupplyChainNetwork.init();
module.exports = foodSupplyChainNetwork;

var fsx = require('fs-extra');
var fabricClient = require('./fabric-client');
var constants = require('../../utils/constants.js');

const logger = require('fabric-client').getLogger('APPLICATION');
//var enrollAdmin = require('../../utils/enrollAdmin');

/**
* A network to wrap the connection/client object to interact with HLF network. 	 	 
*/
class FoodSupplyChainNetwork {

  constructor(userName, password) {    
    this.currentUser;
    this.issuer;

    // This user is used as below:
    // 1: is set as Client's UserContext (sign all request)
    // 2: is set as _tls_mutual (for TLS mutual authentication)
    this.userName = userName;
    this.userPW = password;
    this.admin_user = null;

    this.fabricClient = fabricClient;
  }

  /**
	* Utility method to delete the mutual tls client material used 	 	 
	*/
  _cleanUpTLSKeys()
  {
    let client_config = this.fabricClient.getClientConfig();
    let store_path = client_config.credentialStore.path;
    let crypto_path = client_config.credentialStore.cryptoStore.path;
    fsx.removeSync(crypto_path);
    //fsx.copySync(store_path,crypto_path);
    fsx.removeSync(store_path);
  }

  /**
	* Get and setup TLS mutual authentication for endpoints for this connection (enroll and setUserContext)
	*/
  _setUpTLSKeys()
  {
    return this.fabricClient.initCredentialStores().then(() => {
        
        var caService = this.fabricClient.getCertificateAuthority();

        let request = {
          enrollmentID: this.userName,
          enrollmentSecret: this.userPW,
          profile: 'tls'
        };

        return caService.enroll(request)
        }).then((enrollment) => {

          logger.info('Successfully enrolled admin user "admin"');

          let key = enrollment.key.toBytes();
          let cert = enrollment.certificate;
          this.fabricClient.setTlsClientCertAndKey(cert, key);
          logger.info('Successfully set the mutual TLS client side certificate and key necessary to build network endpoints');
    
          return this.fabricClient.createUser(
              {   
                  username: this.userName,
                  mspid: this._getClientMSPID(),
                  cryptoContent: { privateKeyPEM: enrollment.key.toBytes(), signedCertPEM: enrollment.certificate }
              });

        }).then((user) => {

          this.admin_user = user;
          logger.info('Successfully UserContext: [' + this.userName + '] will be used to sign all requests with the fabric backend.');
          return this.fabricClient.setUserContext(this.admin_user);

        }).catch((err) => {

          logger.error('Failed to tls-enroll ' + this.userName + ':' + err);  
          return Promise.reject(new Error('Failed to tls-enroll ' + this.userName + ':' + err))         

        });  
  }

  /** 
  * Initializes the channel object with the Membership Service Providers (MSPs). The channel's
	* MSPs are critical in providing applications the ability to validate certificates and verify
  * signatures in messages received from the fabric backend.
  */
  _getClientMSPID()
  {
      let mspID = null;
      const client_config = this.fabricClient._network_config.getClientConfig();
      if (client_config && client_config.organization) {
        const organization_config = this.fabricClient._network_config.getOrganization(client_config.organization, true);
        if (organization_config) {
          mspID = organization_config.getMspid();
        }
      }
      if (!mspID) {
        logger.error('Network configuration is missing ttruehis client\'s organization and mspid');  
        throw new Error('Network configuration is missing ttruehis client\'s organization and mspid');
      }

      return mspID;
  }

  _initChannelMSP()
  {
      var channel = this.fabricClient.getChannel(constants.ChannelName);
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
    logger.info(`Enroll with username ${username}`);
    this.fabricClient.loadFromConfig(`configs/fabric-network-config/${org}-profile.yaml`);

    // init the storages for client's state and cryptosuite state based on connection profile configuration 
    return this.fabricClient.initCredentialStores()
        .then(() => {
            // tls-enrollment
            caService = this.fabricClient.getCertificateAuthority();
            return caService.enroll({
                enrollmentID: username,
                enrollmentSecret: password,
                profile: 'tls',
                attr_reqs: [
                    { name: "hf.Registrar.Roles" },
                    { name: "hf.Registrar.Attributes" }
                ]
            }).then((enrollment) => {
              logger.info('Successfully called the CertificateAuthority to get the TLS material');
                let key = enrollment.key.toBytes();
                let cert = enrollment.certificate;

                // set the material on the client to be used when building endpoints for the user
                this.fabricClient.setTlsClientCertAndKey(cert, key);
                return this.fabricClient.setUserContext({ username: username, password: password });
            })
        })
  }

  /**
	 * Init TLS material and usercontext for used by network.
   * Just use init if we wish to have one shared crypto material
	 */
  init() {
    //FBClient.setConfigSetting('initialize-with-discovery', true);
    
    this._cleanUpTLSKeys();
    this._setUpTLSKeys()
    .then(() => {
        this._initChannelMSP()
        .then(() => {    
            logger.info('Successfully initialized ChannelMSP');            
        })
    });
  }

  invoke(fcn, data) {
    // In the futurre, we will change "org1" to any orgs to make load balancer
    // return this._enroll("org1").then(() => {
    //   var dataAsBytes = new Buffer(JSON.stringify(data));		
    //   var tx_id = this.fabricClient.newTransactionID();
    //   var requestData = {
    //     chaincodeId: constants.ChainCodeId,
    //     fcn: fcn,
    //     args: [dataAsBytes],
    //     txId: tx_id
    //   };
    //   return this.fabricClient.submitTransaction(requestData);
    // })    

    var dataAsBytes = new Buffer(JSON.stringify(data));		
      var tx_id = this.fabricClient.newTransactionID();
      var requestData = {
        chaincodeId: constants.ChainCodeId,
        fcn: fcn,
        args: [dataAsBytes],
        txId: tx_id
      };
      return this.fabricClient.submitTransaction(requestData);
  }

  // query(fcn, id, objectType) {
    
  //   // In the futurre, we will change "org1" to any orgs to make load balancer
  //   return this._enroll("org1").then(() => {
  //     let localArgs = [];
  //     if(id) localArgs.push(id);
  //     if(objectType) localArgs.push(objectType);
  
  //     var tx_id = this.fabricClient.newTransactionID();
  //     var requestData = {
  //       chaincodeId: constants.ChainCodeId,
  //       fcn: fcn,
  //       args: localArgs,
  //       txId: tx_id
  //     };
  //     return this.fabricClient.query(requestData);
  //   })
  // }

  query(fcn, id, objectType) {
    
    // In the futurre, we will change "org1" to any orgs to make load balancer    
      let localArgs = [];
      if(id) localArgs.push(id);
      if(objectType) localArgs.push(objectType);
  
      var tx_id = this.fabricClient.newTransactionID();
      var requestData = {
        chaincodeId: constants.ChainCodeId,
        fcn: fcn,
        args: localArgs,
        txId: tx_id
      };
      return this.fabricClient.query(requestData);
    
  }
}

// for this mvp, use admin-org1 as shared user for all users.
var foodSupplyChainNetwork = new FoodSupplyChainNetwork(constants.OrgAdmin.Username, constants.OrgAdmin.Password);
foodSupplyChainNetwork.init();
module.exports = foodSupplyChainNetwork;

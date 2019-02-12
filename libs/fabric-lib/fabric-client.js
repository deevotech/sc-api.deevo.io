var FabricClient = require('fabric-client');
const logger = FabricClient.getLogger('APPLICATION');
var fs = require('fs');
var path = require('path');

var connectionProfilePath = path.join(__dirname, '../../configs/fabric-network-config/connection-profile.yaml');
var connectionClientProfilePath = path.join(__dirname, '../../configs/fabric-network-config/org1-profile.yaml');
const CONFIG = fs.readFileSync(connectionProfilePath, 'utf8')
var eventhubs = []; 

var constants = require('../../utils/constants.js');

class FBClient extends FabricClient {

    constructor(props) {
        
        super(props);
    }

    /**
	 * Submit a transaction process includes:
     * 1. Send proposal transactions
     * 2. Valiate endorsements
     * 3. Send invoke transaction
     * 4. Listen for transacation committed.
	 */
    submitTransaction(requestData) {

        var returnData;
        var _this = this;
        var channel = this.getChannel(constants.ChannelName);
        var peers = this.getPeersForOrg();        
        var eh = channel.newChannelEventHub(peers[0].getName());      
		//eh.connect();
        eventhubs.push(eh);
        
        return channel.sendTransactionProposal(requestData).then(function (results) {

            var proposalResponses = results[0];
            var proposal = results[1];
            var all_proposal_good = true;
            var err_found = null;

            logger.info('TX-PROPOSAL-CHECK: Received ' + proposalResponses.length + ' Proposal Responses' );                    
            //all_proposal_good = proposalResponses.length === 2;
            
            // check if all Proposal Responses status are OK and valided digital signature
            for(var i in proposalResponses) {
                let one_good = false;
                let proposal_response = proposalResponses[i];
                if(proposal_response.code)
                {
                    logger.info(proposal_response.message);
                   err_found =  new Error(proposal_response.message);
                }
                else 
                if ( proposal_response.response && proposal_response.response.status === 200) {                    
                    logger.info('TX-PROPOSAL-CHECK: Proposal response [' + i + '] has Response status of 200');                    
                    one_good = channel.verifyProposalResponse(proposal_response);
                    if(one_good) {
                        logger.info('TX-PROPOSAL-CHECK: Proposal response [' + i + '] signature and endorser are VALID');
                    }                 
                    else 
                    {
                        logger.info('TX-PROPOSAL-CHECK: Proposal response [' + i + '] signature and endorser are IN-VALID');
                        err_found = new Error('TX-PROPOSAL-CHECK: Proposal response [' + i + '] signature and endorser are IN-VALID');
                    }
                }
                
                all_proposal_good = all_proposal_good & one_good;
            }

            if (all_proposal_good) {

                all_proposal_good = channel.compareProposalResponseResults(proposalResponses);
                if(all_proposal_good)
                {
                    logger.info('TX-PROPOSAL-CHECK: All Proposal Responses have a the same Read/Writes set');                
                }
                else
                {
                    logger.info('TX-PROPOSAL-CHECK: All Proposal Responses NOT have a the same Read/Writes set');
                }

                logger.info('TX-PROPOSAL-CHECK: Totally successfully sent Proposal and received valid ProposalResponse: Status - %s, message - "%s"', 
                            proposalResponses[0].response.status, proposalResponses[0].response.message);

                var request = {
                    proposalResponses: proposalResponses,
                    proposal: proposal                    
                };

                var transaction_id_string = requestData.txId.getTransactionID();

                var eventhubPromises = [];
                eventhubs.forEach((eh) => {
                    let ehPromise = new Promise((resolve, reject) => {

                        let handle = setTimeout(() => {
                            eh.unregisterTxEvent(transaction_id_string);
                            eh.disconnect();
                            console.log('REQUEST_TIMEOUT --- eventhub did not report back');
                            reject(new Error('REQUEST_TIMEOUT'));
                        }, 60000);
    
                        eh.registerTxEvent(transaction_id_string.toString(),
                            (tx, code, block_num) => {
                                clearTimeout(handle);                                    
                                if (code !== 'VALID') {                                    
                                    reject(new Error('The transaction was invalid, code = ' + code));
                                } else {                                    
                                    resolve('The transaction has been committed on peer '+ eh.getPeerAddr());
                                }
                            },
                            (err) => {
                                clearTimeout(handle);                                
                                reject(new Error('Successfully received notification of the event call back being cancelled for txid: '+ transaction_id_string + ', with errr:' + err));
                            }                            
                        );

                        eh.connect();
                    });
    
                    eventhubPromises.push(ehPromise);
                });
    
                var sendTransactionPromise = channel.sendTransaction(request);

                // call and wait for all promises results.
                logger.info('Sending endorsed transaction to orderer...');
                return Promise.all([sendTransactionPromise].concat(eventhubPromises))
                    .then((results) => { // if all promises get resolved

                        logger.info('Both sendTransactionPromise and eventhubPromises resolved.');
                        //return results[0]; // the response from main promise.
                        if (results[0].status === 'SUCCESS') {

                            logger.info('******************************************************************');
                            logger.info('Successfully sent transaction['+ requestData.txId.getTransactionID() +'] to the orderer and committed to ledgers');                
                            logger.info('******************************************************************');
                            
                            // close the connections (close peers and orderer connection from this channel) to release resources
                            // channel.close();
                            logger.info('Successfully closed all connections');
            
                            // define result to return back to MODEL classes.                
                            return Promise.resolve(results[0].status);
            
                        } else {
                            logger.info('Failed to order the transaction. Error code: ' + results[0].status);
                            return Promise.reject(results[0].err);
                            //throw new Error('Failed to order the transaction. Error code: ' + response.status);
                        }

                    }).catch((err) => {

                        logger.info('Promise.all() - Failed transaction ::'+ err);                        
                        //throw new Error('Failed to send transaction and get notifications within the timeout period.');                        
                    });

            } else { // all_proposal_good == false 
                logger.error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');                
                if(!err_found)
                    err_found  = new Error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...'); 

                let result = {
                    status : "FAILED",
                    err : err_found    
                };                
                return result;
            }

        },(err) => { // error method of channel.sendTransactionProposal's Promise

            f.fail('Failed to send proposal due to error: ' + err.stack ? err.stack : err);            

        });
    }
    
    query(requestData) {
        var channel = this.getChannel(constants.ChannelName);
        return channel.queryByChaincode(requestData).then((response_payloads) => {
            
            if(response_payloads && response_payloads.length>0)
            {
                if(!response_payloads[0].code)
                {
                    try
                    {
                        let resultData = JSON.parse(response_payloads[0].toString('utf8'));                    
                        return Promise.resolve(resultData);
                    }
                    catch(e)
                    {
                        logger.info('JSON.parse() failed with execption: ' + e);
                        return Promise.reject(new Error('JSON.parse() failed with execption: ' + e));
                    }
                }
                else if(response_payloads[0].code == 2)
                {
                    // return not found object
                    return Promise.resolve(null);
                }
                else
                {
                    return Promise.reject(new Error(response_payloads[0]));
                }
            }
            else {
                logger.info('response_payloads is null');                
                return Promise.reject(new Error('response_payloads is null'))
            }            
        },
        (err) => {
            logger.info('Failed to send query due to error: ' + err.stack ? err.stack : err);
            return Promise.reject(new Error(('Failed to send query due to error: ' + err.stack ? err.stack : err)));
        });
    }
}

var fabricClient = new FBClient();
FBClient.setConfigSetting('initialize-with-discovery', true);
// build _network_config
// and set _admin_siging_identity (used for administrative transactions)
fabricClient.loadFromConfig(connectionProfilePath);
fabricClient.loadFromConfig(connectionClientProfilePath);

module.exports = fabricClient;

function requestChatBot() {
    const params = new URLSearchParams(location.search);
    const oReq = new XMLHttpRequest();
    oReq.addEventListener("load", initBotConversation);
    var path = "/chatBot?";
    if (params.has('userId')) {
        path += "&userId=" + params.get('userId');
    }
    if (params.has('region')) {
        path += "&region=" + params.get('region');
    }
    //if (loc) {
   //     path += "&lat=" + loc.lat + "&long=" + loc.long;
  //  }

    oReq.open("POST", path);
    oReq.send();
}
//function chatRequested() {
  //  const params = new URLSearchParams(location.search);
    //if (params.has('shareLocation')) {
      //  getUserLocation(requestChatBot);
    //}
    //else {
      //  requestChatBot();
    //}
//}
//function getUserLocation(callback) {
  //  navigator.geolocation.getCurrentPosition(
    //    function(position) {
      //      var latitude  = position.coords.latitude;
        //    var longitude = position.coords.longitude;
          //  var location = {
            //    lat: latitude,
              //  long: longitude
          //  }
            //callback(location);
        //},
      //  function(error) {
            // user declined to share location
          //  console.log("location error:" + error.message);
         //   callback();
       // });
//}
//Suggestion for document referrer location
//function getParentUrl() {
  //  var isInIframe = (parent !== window),
    //    parentUrl = null;

    //if (isInIframe) {
      //  parentUrl = document.referrer;
    //}

    //return parentUrl;
//}
function initBotConversation() {
    if (this.status >= 400) {
        alert(this.statusText);
        return;
    }
    // extract the data from the JWT
    const jsonWebToken = this.response;
    const tokenPayload = JSON.parse(atob(jsonWebToken.split('.')[1]));
    const user = {
        id: tokenPayload.userId,
        name: tokenPayload.userName
    };
    let domain = undefined;
    if (tokenPayload.directLineURI) {
        domain =  "https://" +  tokenPayload.directLineURI + "/v3/directline";
    }
    let region = undefined;
    if (tokenPayload.region) {
        region = tokenPayload.region;
    }
    var botConnection = window.WebChat.createDirectLine({
        token: tokenPayload.connectorToken,
        domain: domain
    });
    const styleOptions = {
       // botAvatarImage: 'https://media-exp1.licdn.com/dms/image/C4E0BAQEclA3Vh3sTNw/company-logo_200_200/0?e=2159024400&v=beta&t=KD7qFl36K5BdZmGGqu1k8uZD-wYIn47CW_nR5f0l1z4',
         botAvatarInitials: 'C',
        // userAvatarImage: '',
        hideSendBox: true, /* set to true to hide the send box from the view */
        //botAvatarInitials: 'C',
        userAvatarInitials: 'You',
        backgroundColor: '#555659'
       // backgroundColor: '#F8F8F8'
    };

    const store = window.WebChat.createStore(
        {},
        function(store) {
            return function(next) {
                return function(action) {
                    if (action.type === 'DIRECT_LINE/CONNECT_FULFILLED') {

                        // Use the following activity to enable an authenticated end user experience
                        /*
                        store.dispatch({
                            type: 'WEB_CHAT/SEND_EVENT',
                            payload: {
                                name: "InitAuthenticatedConversation",
                                value: jsonWebToken
                            }
                        });
                        */

                        // Use the following activity to proactively invoke a bot scenario
                        
                        store.dispatch({
                            type: 'DIRECT_LINE/POST_ACTIVITY',
                            meta: {method: 'keyboard'},
                            payload: {
                                activity: {
                                    type: "invoke",
                                    name: "TriggerScenario",
                                    value: {
                                        trigger: "covid19_assessment",
                                        args: {region: region}
                                    }
                                }
                            }
                        });
                        
                    }
                    return next(action);
                }
            }
        }
    );

    const webchatOptions = {
        directLine: botConnection,
        store: store,
        styleOptions: styleOptions,
        userID: user.id,
        username: user.name,
        locale: 'en'
    };
    startChat(user, webchatOptions);
}

function startChat(user, webchatOptions) {
    const botContainer = document.getElementById('webchat');
    window.WebChat.renderWebChat(webchatOptions, botContainer);
}


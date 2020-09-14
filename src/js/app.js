App = {
  web3Provider: null,
  contracts: {},
  account: 0x0,

  init: async function() {
    return await App.initWeb3();
  },

  initWeb3: async function() {
   // Modern dapp browsers...
   // This is the case of Metamask added to chrome
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new     Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);
    //----
    return App.initContract();
  },

  initContract: function() {

    $.getJSON("Covid.json", function(covid){
      // Instantiate a new truffle contract from the artifact
      App.contracts.Covid = TruffleContract(covid);
      // Connect provider to interact with contract
      App.contracts.Covid.setProvider(App.web3Provider);
      App.listenForEvents();
      return App.render();
    });
    
  },

  render: function(){
    let contestInstance;
    let loader = $("#loader");
    let content = $("#content");

    loader.show();
    content.hide();
    console.log("from render");
    //load account data*
    web3.eth.getCoinbase(function(err, account){
      if (err === null){
        App.account = account;
        console.log(account);
        console.log(App.account);
        $("#accountAddress").html("Your Account: " + account);
      }
    });
    //load contract data
    App.contracts.Covid.deployed().then(instance =>{
      covidInstance = instance;
      return covidInstance.passengersCount();
    }).then(passengersCount => {
      let passengersResults = $("#passengersResults");
      passengersResults.empty();

      for (let i =1; i <= passengersCount; i++) {
        covidInstance.passengers(i).then(passenger =>{
          // Extract a contestant infos
          let id = passenger[0];
          let passportId = passenger[1];
          let name = passenger[2];
          let from = passenger[3];
          let to = passenger[4];

          // Render contestant result
          let passengerTemplate = "<tr><th scope=\"row\">" + id 
                  + "</th><td>" + passportId + "</td><td>" + name + "</td><td>" 
                  + from + "</td><td>" + to + "</td></tr>";
          passengersResults.append(passengerTemplate);
        })
      }
      loader.hide();
      content.show();

    });
  },

  // This function will be tigerred once we submit the form
  addPassenger: function() {
    let passengerId = $("#passportId").val();
    let name = $("#name").val();
    let from = $("#from").val();
    let to = $("#to").val();
    
    console.log(passengerId + ", " + name + ", " + from + ", " + to);
    App.contracts.Covid.deployed().then(instance =>{
      return instance.addPassenger(passengerId, name, from, to);
    }).then(result =>{
      //Wait for the passengers to update
      $("#content").hide();
      $("#loader").show();
    }).catch(err => console.log(err));
  },

  //Function that listens to events emitted from the contract
  listenForEvents: function(){
    App.contracts.Covid.deployed().then( function(instance){
      instance.alertEvent({}, { 
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event){
        console.log("event triggered", event);
        // Reload when a new vote is recorded
        App.render();

      });
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});

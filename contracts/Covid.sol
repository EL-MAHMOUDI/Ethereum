//specifying the Solidity version
pragma solidity 0.5.16;

//Creating the contract
/**
 * The Contest contract does this and that...
 */
contract Covid {
  //Declaring the structure: the properties that model the contestant
  struct Passenger {
  	uint id;
    string passportId;
  	string name;
  	string from;
    string to;
  }

  //use mapping to get or fetch the contestant details
  mapping (uint => Passenger) public passengers; 
 
  //add a public state variable to keep track of contestants count
  uint public passengersCount;

  // Vote event
  event alertEvent(string _name);
  
  //Declaring constructor
  constructor() public {
    //addPassenger("F145Lk2", "TOM", "LONDON", "NEW YORK");
  }

  //add a function to add an infected Passenger
  function addPassenger (string memory _passportId, string memory _name, string memory _from,string memory _to) public {
  	passengersCount++;
  	passengers[passengersCount] = Passenger(passengersCount, _passportId, _name, _from, _to);
    emit alertEvent(_name);
  }
  
}


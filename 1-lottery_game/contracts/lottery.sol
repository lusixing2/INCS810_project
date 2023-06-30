pragma solidity <0.9.0;

contract Lottery {
    address public manager;
    address payable[] public players;
    uint256 public minimumBet;
    uint256 public totalBet;
    address public lastWinner;

    constructor() public {
        manager = msg.sender;
        minimumBet = 1 ether; // Minimum bet amount is set to 1 ether
    }

    function enter() public payable {
        require(msg.value >= minimumBet, "Insufficient bet amount");

        players.push(payable(msg.sender));
        totalBet += msg.value;
    }

    function random() private view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(block.difficulty, block.timestamp, players.length)));
    }

    function pickWinner() public restricted {
        uint256 index = random() % players.length;
        players[index].transfer(address(this).balance);
        lastWinner = players[index];
        players = new address payable[](0);
        totalBet = 0;
    }

    function getPlayers() public view returns (address payable[] memory) {
        return players;
    }

    modifier restricted() {
        require(msg.sender == manager, "Only the manager can call this function");
        _;
    }
}
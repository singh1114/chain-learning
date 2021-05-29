pragma solidity ^0.4.17;

contract Lottery {
    address public manager;
    address[] public players;

    function Lottery() public {
        manager = msg.sender;
    }

    function enter() public payable {
        require(msg.value > 0.01 ether);
        players.push(msg.sender);
    }

    function pickWinner() public restrictedByManager {
        players[random() % players.length].transfer(this.balance);
        players = new address[](0);
    }

    function random() private view returns (uint) {
        return uint(keccak256(block.difficulty, now, players));
    }

    function getPlayers() public view returns (address[]) {
        return players;
    }

    function getCurrentBalance() public view returns (uint) {
        return this.balance;
    }

    modifier restrictedByManager() {
        require(msg.sender == manager);
        _;
    }
}
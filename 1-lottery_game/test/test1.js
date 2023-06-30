const Lottery = artifacts.require('Lottery');

contract('Lottery', (accounts) => {
  let lotteryInstance;

  beforeEach(async () => {
    lotteryInstance = await Lottery.new();
  });

  it('should allow a player to enter the lottery', async () => {
    const initialBalance = web3.utils.toWei('1', 'ether');
    const player = accounts[1];

    await lotteryInstance.enter({ from: player, value: initialBalance });

    const players = await lotteryInstance.getPlayers();
    assert.equal(players.length, 1, 'Number of players should be 1');
    assert.equal(players[0], player, 'The entered player should be in the players list');
  });

  it('should not allow a player to enter the lottery with insufficient bet amount', async () => {
    const invalidBalance = web3.utils.toWei('0.5', 'ether');
    const player = accounts[1];

    try {
      await lotteryInstance.enter({ from: player, value: invalidBalance });
      assert.fail('Expected an exception to be thrown');
    } catch (error) {
      assert(error.message.includes('Insufficient bet amount'), 'Should throw an exception with the correct error message');
    }
  });

  it('should pick a winner and reset the player list and total bet', async () => {
    const initialBalance = web3.utils.toWei('1', 'ether');
    const player1 = accounts[1];
    const player2 = accounts[2];

    await lotteryInstance.enter({ from: player1, value: initialBalance });
    await lotteryInstance.enter({ from: player2, value: initialBalance });

    const initialContractBalance = await web3.eth.getBalance(lotteryInstance.address);

    await lotteryInstance.pickWinner({ from: accounts[0] });

    const finalContractBalance = await web3.eth.getBalance(lotteryInstance.address);
    const players = await lotteryInstance.getPlayers();

    assert.equal(finalContractBalance, 0, 'Contract balance should be zero after picking a winner');
    assert.equal(players.length, 0, 'Number of players should be zero after picking a winner');
    assert.equal(initialContractBalance, initialBalance * 2, 'Contract balance before picking a winner should be equal to 2 times the initial balance');
  });
});

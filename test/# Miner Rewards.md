# Miner Rewards


### Inital Miner Reward Breakdown

Initially, the reward was hardcoded to be `5 + currentTotalTip/5`. The 5 is the base reward and currentTotalTip to be the total tip amount for that particular request.

For example:

    symbol = "BTC/USD"
    api = "json(https://api.binance.com/api/v1/klines?symbol=BTCUSDT&interval=1d&limit=1).0.4";
    granularity = 1000
    tip = 52;
    await zap.requestData(api, symbol, granularity, tip);

    minerReward = 5 + 52 /5 => 15 tokens

For as long as users take part mining, the rewards will always be a minimun of 5 tokens rewards.



### Currently Implemented Miner Reward Breakdown

The baseReward is calculated to start at 5 and will decrease as requests are mined by the miners.

    if (baseReward == 0){
        baseReward = 6e18;
    }

    if (baseReward > 1e18) {
        baseReward = baseReward - baseReward * 30612633181126 / 1e18; 
        devShare = (baseReward / 1e18) * 50/100;
    } else {
        baseReward = 1e18;
    }

    minerReward = baseReward + totalTips / 5


Using the same example:

    symbol = "BTC/USD"
    api = "json(https://api.binance.com/api/v1/klines?symbol=BTCUSDT&interval=1d&limit=1).0.4";
    granularity = 1000
    tip = 52;
    await zap.requestData(api, symbol, granularity, tip);

    Base reward will start at 5:
    minerReward = 5 + 52 /5 => 15 tokens

    And if someone requestData with the same params as the example, the base reward after 4-5000 blocks will be 4.
    minerReward = 4 + 52 /5 => 14 tokens

    Over time it will eventually settle on 1.


I'm estimating 4-5000 blocks for the base reward to change, but base reward can be adjusted by changing baseReward = baseReward - baseReward * `30612633181126 / 1e18`. This can also be used to promote early staking/mining  = higher rewards.


![simpleLineGraph](https://user-images.githubusercontent.com/24558257/123880756-52b1fd80-d911-11eb-88e4-1236e273cc9b.png)
![Screen Shot 2021-06-29 at 1 46 02 PM](https://user-images.githubusercontent.com/24558257/123843890-5da06a00-d8e0-11eb-9643-94c384a60536.png)
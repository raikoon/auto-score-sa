# auto-score-sa
Small script to refill your fleets in Star Atlas (space game in Solana's blockchain) using their official SDK.
It refills your fleet when it's been more than 12h since the last refill and it adds specifically half a day of supplies, it was built to run as a cronjob, I run it every 20min just in case a transaction fails in times of network performance issues.

Install node v16.11.1, if you have nvm installed just:
```
nvm use
```

Create user-config.js with sample template (user-config-sample.js) and fill private key as exported from Phantom wallet.

```
//install packages
npm install

//run
node index.js
```

Wanna tip me? -> 2xdgqwWNjs5KYTS7BVj3GMh5kiimzeSxZdJJhxts111m
I appreciate tips and suggestions, thanks!
### Roadmap
 - ~~Refill fleets~~
 - Claim rewards
 - Buy resources
 - Sell Atlas / Swap for Polis (?)
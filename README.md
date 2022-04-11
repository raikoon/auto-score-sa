# auto-score-sa
Small script to refill your fleets in Star Atlas using their official SDK.
It refills your fleet when it's been more than 12h since the last refill and it adds specifically half a day of supplies, it was built to run as a cronjob, I run it every 20min just in case a transaction fails in times of network performance issues.

Install node v16.11.1

Create user-config.js with sample template and fill private key.

```
//install packages
npm install

//run
node index.js
```

### Roadmap
 - ~~Refill fleets~~
 - Manage rewards
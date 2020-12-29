import { loadStdlib } from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';

(async () => {
    const stdlib = await loadStdlib();
    const startingBalance = stdlib.parseCurrency(10);
    
    const accPot = await stdlib.newTestAccount(startingBalance);
    const accAuctioneer = await stdlib.newTestAccount(startingBalance);
    const ctcAuctioneer = accAuctioneer.deploy(backend);

    const fmt = (x) => stdlib.formatCurrency(x, 4);
    const getBalance = async (who) => fmt(await stdlib.balanceOf(who));

    await Promise.all([
        backend.Auctioneer(ctcAuctioneer, {
            getParams: () => ({
                betPrice: 5,
                deadline: 10,
                potAddr: accPot,
            }),
        }),
    ]);

    const potTotal = await getBalance(accPot);
    console.log(`The final price of the pot is ${potTotal}`);
})();
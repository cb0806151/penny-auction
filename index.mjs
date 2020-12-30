import { loadStdlib } from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';

const N = 10;

(async () => {
    const stdlib = await loadStdlib();
    const startingBalance = stdlib.parseCurrency(10);
    
    const accAttendee_arr = await Promise.all( Array.from({length: N}, () => stdlib.newTestAccount(startingBalance)) );

    const accPot = await stdlib.newTestAccount(startingBalance);
    const ctcPot = accPot.deploy(backend);
    const ctcInfo = ctcPot.getInfo();

    const fmt = (x) => stdlib.formatCurrency(x, 4);
    const getBalance = async (who) => fmt(await stdlib.balanceOf(who));

    const bet = Math.floor(Math.random() * 10);

    await Promise.all([
        backend.Pot(ctcPot, {
            getParams: () => ({
                deadline: 10,
                potAmount: stdlib.parseCurrency(1)
            }),
        }),
        backend.Attendee(accAttendee_arr[0].attach(backend, ctcInfo), {})
    ]);
    
    const address = await accAttendee_arr[0].networkAccount.address;
    const total = await getBalance(accAttendee_arr[0]);
    const potTotal = await getBalance(accPot);
    console.log(`${address} walks away with ${total} leaving the pot at ${potTotal}`);

})();
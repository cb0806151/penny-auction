import { loadStdlib } from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';

const N = 10;

(async () => {
    const stdlib = await loadStdlib();
    const startingBalance = stdlib.parseCurrency(10);
    
    const accAttendee_arr = await Promise.all( Array.from({length: N}, () => stdlib.newTestAccount(startingBalance)) );

    const accAuctioneer = await stdlib.newTestAccount(startingBalance);
    const ctcAuctioneer = accAuctioneer.deploy(backend);
    const ctcInfo = ctcAuctioneer.getInfo();

    const fmt = (x) => stdlib.formatCurrency(x, 4);
    const getBalance = async (who) => fmt(await stdlib.balanceOf(who));

    const bet = Math.floor(Math.random() * 10);

    console.log(`The auctioneer and the attendee both start the game at 10 each`)

    await Promise.all([
        backend.Auctioneer(ctcAuctioneer, {
            informTimeout: () => {
                console.log(`And the auction has finished`);
            },
            initialPotAmount: async (amount) => {
                console.log(`The initial price of the pot is ${fmt(amount)}`);
            },
            getParams: () => ({
                deadline: 5,
                potAmount: stdlib.parseCurrency(5)
            }),
        }),
        backend.Attendee(accAttendee_arr[0].attach(backend, ctcInfo), {
            informTimeout: () => {
                console.log("The attendee has seen that the auction has finished");
            },
            submitBet: async (betAmount) => {
                for ( let i = 0; i < 15; i++ ) {
                    process.stdout.write(".");
                    await stdlib.wait(1);
                }
                console.log(`The attendee places a bet of ${fmt(betAmount)}`)
            }
        })
    ]);

    const address = await accAttendee_arr[0].networkAccount.address;
    const total = await getBalance(accAttendee_arr[0]);
    const potTotal = await getBalance(accAuctioneer);
    console.log(`The attendee walks away with ${total} and the auctioneer with ${potTotal}`);

})();
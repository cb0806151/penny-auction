import { loadStdlib } from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';

const N = 1;

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
            auctionEnds: () => {
                console.log(`And the auction has finished`);
            },
            initialPotAmount: async (amount) => {
                console.log(`The initial price of the pot is ${fmt(amount)}`);
            },
            getParams: () => ({
                deadline: 5,
                potAmount: stdlib.parseCurrency(5),
                potAddress: accAuctioneer
            }),
        }),
    ].concat(
        accAttendee_arr.map((accAttendee, i) => {
            const ctcAttendee = accAttendee.attach(backend, ctcInfo);
            return backend.Attendee(ctcAttendee, {
                auctionEnds: () => {
                    return;
                },
                submitBet: async(betAmount) => {
                    console.log(`The attendee places a bet of ${fmt(betAmount)}`);
                },
                placedBet: async (attendeeAddress, betAmount) => {
                    if ( stdlib.addressEq(attendeeAddress, accAttendee) ) {
                        console.log(`${attendeeAddress} bet: ${betAmount}`);
                    }
                },
                mayBet: async (betAmount) => {
                    const balance = await getBalance(accAttendee);
                    return balance > betAmount;
                }
            })
        })
    ));

    const address = await accAttendee_arr[0].networkAccount.address;
    const total = await getBalance(accAttendee_arr[0]);
    const potTotal = await getBalance(accAuctioneer);
    console.log(`The attendee walks away with ${total} and the auctioneer with ${potTotal}`);

})();
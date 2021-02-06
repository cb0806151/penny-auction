import { loadStdlib } from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';

const N = 3;

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

    const getAddressBalance = async (accountNumber) => {
        const voterBalance = await getBalance(accAttendee_arr[accountNumber]);
        const address = await accAttendee_arr[accountNumber].networkAccount.address;
        console.log(`${address} has a balance of ${voterBalance}`);
    }
    const listParticipantBalances = async () => {
        for ( let i = 0; i < N; i++) {
            await getAddressBalance(i);
        }
    }

    console.log(`\nThe auctioneer and the attendees start the game at 10 each`)

    await Promise.all([
        backend.Auctioneer(ctcAuctioneer, {
            auctionEnds: async (potBalance) => {
                console.log(`And the auction has finished with the pot at ${fmt(potBalance)}`);
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
                auctionEnds: async (potBalance) => {
                    console.log(`And ${accAttendee.networkAccount.address} saw the auction has finished with the pot at ${fmt(potBalance)}`);
                },
                placedBet: async (attendeeAddress, betAmount) => {
                    if ( stdlib.addressEq(attendeeAddress, accAttendee) ) {
                        const balance = await getBalance(accAttendee);
                        console.log(`\n${accAttendee.networkAccount.address} bet: ${fmt(betAmount)} leaving their balance at ${balance}\n`);
                    } else {
                        console.log(`${accAttendee.networkAccount.address} saw that ${attendeeAddress} bet ${fmt(betAmount)}`)
                    }
                },
                mayBet: async (betAmount) => {
                    const balance = await getBalance(accAttendee);
                    const mayBet = balance > fmt(betAmount);
                    if (mayBet) return Math.random() > 0.5;
                    return mayBet;
                },
            })
        })
    ));
    const auctioneerBalance = await getBalance(accAuctioneer);
    console.log(`And the auctioneer is left with ${auctioneerBalance}`);
    await listParticipantBalances();

})();
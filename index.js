import factory, { getScoreEscrowAuthAccount } from "@staratlas/factory"
import { Connection, PublicKey, Keypair, Transaction, TransactionInstruction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import anchor from '@project-serum/anchor'
import moment from "moment"
import config from "./user-config.js";
// console.log(config);


const secretk = from_b58(config.privateKey);

const priv = Keypair.fromSecretKey(secretk)
const connection = new Connection(config.endpoint);
const programId = new PublicKey("FLEET1qqzpexyaDpqb2DGsSzE2sDCizewCg9WjrA6DBW");
const mints = {
    food: new PublicKey("foodQJAztMzX1DKpLaiounNe2BDMds5RNuPC6jsNrDG"),
    fuel: new PublicKey("fueL3hBZjLLLJHiFH9cqZoozTG3XQZ53diwFPwbzNim"),
    ammo: new PublicKey("ammoK8AkX2wnebQb35cDAZtTkvsXQbi82cGeTnUvvfK"),
    tool: new PublicKey("tooLsNYLiVqzg8o4m3L2Uetbn62mvMWRqkog6PQeYKL")
}
const player = priv.publicKey
var getAccount = async function(player, mint) {
    var ret = await PublicKey.findProgramAddress([
        player.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
    ], new PublicKey(
        'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
    ))
    return ret[0].toString();
}
const foodaccount = await getAccount(player, mints.food);

const fuelaccount = await getAccount(player, mints.fuel);

const ammoaccount = await getAccount(player, mints.ammo);

const toolaccount = await getAccount(player, mints.tool);
// console.log(foodaccount, fuelaccount, ammoaccount, toolaccount);
const {
    web3
} = anchor
const { getScoreVarsAccount, getScoreVarsShipInfo, getScoreVarsInfo, getShipStakingAccountInfo, getScoreEscrowAccount, getAllFleetsForUserPublicKey, createRefeedInstruction, createRefuelInstruction, createRearmInstruction, createRepairInstruction } = factory;

const refillFleet = async(fleetUnit, amounts) => {
    if (!amounts) {
        amounts = {
            food: 1,
            fuel: 1,
            arms: 1,
            toolkit: 1
        }
    }
    const refeed = await createRefeedInstruction(connection, player, player, amounts.food, fleetUnit.shipMint, mints.food, foodaccount, programId)
    const refuel = await createRefuelInstruction(connection, player, player, amounts.fuel, fleetUnit.shipMint, mints.fuel, fuelaccount, programId)
    const reammo = await createRearmInstruction(connection, player, player, amounts.arms, fleetUnit.shipMint, mints.ammo, ammoaccount, programId)
    const retool = await createRepairInstruction(connection, player, player, amounts.toolkit, fleetUnit.shipMint, mints.tool, toolaccount, programId)

    let trans = new Transaction({ feePayer: player })
    let ins = new TransactionInstruction(refeed)
    trans.add(ins)
    let ins3 = new TransactionInstruction(refuel)
    trans.add(ins3)
    let ins7 = new TransactionInstruction(retool)
    trans.add(ins7)
    let ins5 = new TransactionInstruction(reammo)
    trans.add(ins5)

    let result = await web3.sendAndConfirmTransaction(connection, trans, [priv, priv]);
    return result
}

const main = async() => {
        const fleet = await getAllFleetsForUserPublicKey(connection, player, programId)

        console.log("Run at: " + moment().format("dddd, MMMM Do YYYY, h:mm:ss a"))
        fleet.forEach(async(f, index) => {
            const info = await getScoreVarsShipInfo(connection, programId, f.shipMint);
            const real = await getShipStakingAccountInfo(connection, programId, f.shipMint, player);

            const needsRefill = moment.unix(f.fedAtTimestamp.toNumber()).isBefore(moment().subtract(12, 'hours').subtract(60, 'seconds'))
            console.log("Fleet " + f.shipMint + " | Last refill: " + moment.unix(f.fedAtTimestamp.toNumber()).format("dddd, MMMM Do YYYY, h:mm:ss a") + (needsRefill ? " -> NEEDS REFILL" : " OK"))

            const halfday = {
                food: parseInt(12 / ((((info.millisecondsToBurnOneFood / 1000) / 60) / 60) / f.shipQuantityInEscrow.toNumber())),
                fuel: parseInt(12 / ((((info.millisecondsToBurnOneFuel / 1000) / 60) / 60) / f.shipQuantityInEscrow.toNumber())),
                arms: parseInt(12 / ((((info.millisecondsToBurnOneArms / 1000) / 60) / 60) / f.shipQuantityInEscrow.toNumber())),
                toolkit: parseInt(12 / ((((info.millisecondsToBurnOneToolkit / 1000) / 60) / 60) / f.shipQuantityInEscrow.toNumber()))
            }
            if (needsRefill) {
                // console.log("Fill: ")
                const tx = await refillFleet(f, halfday)
                console.log(f.shipMint + " refilled: " + tx)
            }


        })



    }
    // this function takes private key from phantom and decodes to Uint8Array
function from_b58(S) {
    const A = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    var d = [], //the array for storing the stream of decoded bytes
        b = [], //the result byte array that will be returned
        i, //the iterator variable for the base58 string
        j, //the iterator variable for the byte array (d)
        c, //the carry amount variable that is used to overflow from the current byte to the next byte
        n; //a temporary placeholder variable for the current byte
    for (i in S) { //loop through each base58 character in the input string
        j = 0, //reset the byte iterator
            c = A.indexOf(S[i]); //set the initial carry amount equal to the current base58 digit
        if (c < 0) //see if the base58 digit lookup is invalid (-1)
            return undefined; //if invalid base58 digit, bail out and return undefined
        c || b.length ^ i ? i : b.push(0); //prepend the result array with a zero if the base58 digit is zero and non-zero characters haven't been seen yet (to ensure correct decode length)
        while (j in d || c) { //start looping through the bytes until there are no more bytes and no carry amount
            n = d[j]; //set the placeholder for the current byte
            n = n ? n * 58 + c : c; //shift the current byte 58 units and add the carry amount (or just add the carry amount if this is a new byte)
            c = n >> 8; //find the new carry amount (1-byte shift of current byte value)
            d[j] = n % 256; //reset the current byte to the remainder (the carry amount will pass on the overflow)
            j++ //iterate to the next byte
        }
    }
    while (j--) //since the byte array is backwards, loop through it in reverse order
        b.push(d[j]); //append each byte to the result
    return new Uint8Array(b) //return the final byte array in Uint8Array format
}



main()
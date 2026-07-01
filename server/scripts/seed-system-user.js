require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const userModel = require("../src/models/user.model");
const accountModel = require("../src/models/account.model");
const ledgerModel = require("../src/models/ledger.model");
const transactionModel = require("../src/models/transaction.model");

const EMAIL = process.env.SYSTEM_EMAIL || "system@house.ledger";
const PASSWORD = process.env.SYSTEM_PASSWORD || "systempassword";
const NAME = "System House Account";

async function seed() {
    try {
        console.log("Connecting to Database: ", process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Database connected successfully.");

        let user = await userModel.findOne({ email: EMAIL }).select("+systemUser");

        if (!user) {
            console.log(`Creating new system user: ${EMAIL}...`);
            // Create user
            user = await userModel.create({
                email: EMAIL,
                password: PASSWORD,
                name: NAME,
                systemUser: true // Mongoose allows setting immutable properties on creation
            });
            console.log("System user created.");
        } else {
            console.log(`System user already exists: ${EMAIL}`);
            if (!user.systemUser) {
                console.log("User exists but is not marked as systemUser. Updating systemUser flag...");
                // Since Mongoose marked systemUser as immutable, we bypass it via direct MongoDB update
                await userModel.updateOne({ _id: user._id }, { $set: { systemUser: true } });
                console.log("Updated systemUser flag via raw MongoDB update.");
            }
        }

        // Verify system account exists
        let account = await accountModel.findOne({ user: user._id });
        if (!account) {
            console.log("Creating house account...");
            account = await accountModel.create({
                user: user._id,
                currency: "INR",
                status: "ACTIVE"
            });
            console.log("House account created:", account._id);
        } else {
            console.log("House account already exists:", account._id);
        }

        // Check system account balance
        const balance = await account.getBalance();
        console.log("Current House Account Balance:", balance);

        // If balance is 0 or less, mint some infinite funds for the house account
        if (balance <= 0) {
            console.log("Minting initial infinite funds for the house account...");
            // The house account DEBITs/CREDITs itself, or we can write a massive credit from a dummy transaction
            // Wait, how does initial house account get funds? It can have a credit without a debit, or we can write
            // a custom ledger entry.
            // Let's create a dummy completed transaction where fromAccount = account._id, toAccount = account._id, amount = 10000000.
            // Or simply a credit ledger entry with no fromAccount, but ledgerSchema requires transaction.
            const idempotencyKey = "system-initial-funding-" + Date.now();
            const transaction = await transactionModel.create({
                fromAccount: account._id,
                toAccount: account._id,
                amount: 10000000,
                idempotencyKey: idempotencyKey,
                status: "COMPLETED"
            });

            // Since it's a self transfer, let's write a credit to make the house account positive.
            // Wait, if it writes a debit and a credit of 10,000,000, net balance remains 0!
            // To make the house account have infinite money, we can write a CREDIT ledger entry without a DEBIT,
            // or simply give it a massive credit ledger entry. Let's create a credit ledger entry for the house account.
            // For bookkeeping, the system user can have a credit entry representing "creation" of money.
            await ledgerModel.create({
                account: account._id,
                amount: 100000000, // 100 million
                transaction: transaction._id,
                type: "CREDIT"
            });

            console.log("House account funded with 100,000,000 INR.");
            console.log("New House Account Balance:", await account.getBalance());
        }

        console.log("Seeding complete. Use these credentials to log in as system user:");
        console.log("Email:", EMAIL);
        console.log("Password:", PASSWORD);

        process.exit(0);
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
}

seed();

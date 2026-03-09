import { SQLiteDatabase } from 'expo-sqlite';

const DATABASE_VERSION = 8;

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
    try {
        const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
        let currentDbVersion = result?.user_version ?? 0;

        console.log("Current DB version:", currentDbVersion);

        if (currentDbVersion >= DATABASE_VERSION) {
            return;
        }

        if (currentDbVersion === 0) {
            // Initial setup including advanced debt system
            await db.execAsync(`
                PRAGMA journal_mode = WAL;
                
                DROP TABLE IF EXISTS wishlist;
                CREATE TABLE wishlist (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    price TEXT,
                    color TEXT,
                    icon TEXT,
                    cost TEXT,
                    targetDate TEXT,
                    progress REAL DEFAULT 0,
                    commitments TEXT,
                    image TEXT,
                    url TEXT
                );

                CREATE TABLE IF NOT EXISTS categories (
                    id TEXT PRIMARY KEY NOT NULL,
                    name TEXT NOT NULL,
                    type TEXT NOT NULL,
                    group_name TEXT NOT NULL,
                    limit_val REAL DEFAULT 0,
                    icon TEXT NOT NULL,
                    color TEXT NOT NULL,
                    order_index REAL DEFAULT 0
                );

                CREATE TABLE IF NOT EXISTS transactions (
                    id TEXT PRIMARY KEY NOT NULL,
                    title TEXT NOT NULL,
                    amount REAL NOT NULL,
                    date TEXT NOT NULL,
                    type TEXT NOT NULL,
                    categoryId TEXT,
                    image TEXT,
                    FOREIGN KEY (categoryId) REFERENCES categories(id)
                );

                CREATE TABLE IF NOT EXISTS settings (
                    key TEXT PRIMARY KEY NOT NULL,
                    value TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS debts (
                    id TEXT PRIMARY KEY NOT NULL,
                    person TEXT NOT NULL,
                    description TEXT NOT NULL,
                    date TEXT NOT NULL,
                    initialAmount REAL NOT NULL,
                    remainingAmount REAL NOT NULL,
                    direction TEXT NOT NULL, -- 'left' or 'right'
                    status TEXT NOT NULL, -- 'pending' or 'paid'
                    categoryId TEXT,
                    FOREIGN KEY (categoryId) REFERENCES categories(id)
                );

                CREATE TABLE IF NOT EXISTS debt_payments (
                    id TEXT PRIMARY KEY NOT NULL,
                    debtId TEXT NOT NULL,
                    amount REAL NOT NULL,
                    date TEXT NOT NULL,
                    FOREIGN KEY (debtId) REFERENCES debts(id) ON DELETE CASCADE
                );

                CREATE TABLE IF NOT EXISTS profile (
                    id INTEGER PRIMARY KEY DEFAULT 1,
                    firstName TEXT,
                    lastName TEXT,
                    email TEXT,
                    phone TEXT,
                    password TEXT
                );

                -- Initial default settings
                INSERT OR IGNORE INTO settings (key, value) VALUES ('savingsGoal', '0');
                INSERT OR IGNORE INTO settings (key, value) VALUES ('savingsGoalPeriod', 'Monthly');
                INSERT OR IGNORE INTO settings (key, value) VALUES ('expenseGoal', '0');
                INSERT OR IGNORE INTO settings (key, value) VALUES ('expenseGoalPeriod', 'Monthly');
                INSERT OR IGNORE INTO settings (key, value) VALUES ('debtLimit', '0');
                INSERT OR IGNORE INTO settings (key, value) VALUES ('debtLimitPeriod', 'Monthly');
                INSERT OR IGNORE INTO settings (key, value) VALUES ('investmentLimit', '0');
                INSERT OR IGNORE INTO settings (key, value) VALUES ('investmentLimitPeriod', 'Monthly');
                INSERT OR IGNORE INTO settings (key, value) VALUES ('incomeGoal', '0');
                INSERT OR IGNORE INTO settings (key, value) VALUES ('incomeGoalPeriod', 'Monthly');
                INSERT OR IGNORE INTO settings (key, value) VALUES ('budget', '0');
                INSERT OR IGNORE INTO settings (key, value) VALUES ('budgetPeriod', 'Monthly');
                INSERT OR IGNORE INTO settings (key, value) VALUES ('subtractSavingsFromBudget', 'true');
                INSERT OR IGNORE INTO settings (key, value) VALUES ('subtractInvestmentFromBudget', 'true');
                INSERT OR IGNORE INTO settings (key, value) VALUES ('subtractDebtFromBudget', 'true');

                INSERT OR IGNORE INTO profile (id, firstName, lastName, email, phone, password)
                VALUES (1, 'Ryan Reimann', 'Layno', 'ryan.layno@example.com', '0917 123 4567', 'password123');
            `);
            currentDbVersion = 8;
        }

        if (currentDbVersion < 2) {
             try {
                await db.execAsync(`ALTER TABLE categories ADD COLUMN order_index REAL DEFAULT 0;`);
             } catch (e) {}
             currentDbVersion = 2;
        }

        if (currentDbVersion === 2) {
            await db.execAsync(`
                CREATE TABLE IF NOT EXISTS debts (
                    id TEXT PRIMARY KEY NOT NULL,
                    person TEXT NOT NULL,
                    description TEXT NOT NULL,
                    date TEXT NOT NULL,
                    initialAmount REAL NOT NULL,
                    remainingAmount REAL NOT NULL,
                    direction TEXT NOT NULL,
                    status TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS debt_payments (
                    id TEXT PRIMARY KEY NOT NULL,
                    debtId TEXT NOT NULL,
                    amount REAL NOT NULL,
                    date TEXT NOT NULL,
                    FOREIGN KEY (debtId) REFERENCES debts(id) ON DELETE CASCADE
                );
            `);
            currentDbVersion = 3;
        }

        if (currentDbVersion === 3) {
            try {
                await db.execAsync(`ALTER TABLE debts ADD COLUMN categoryId TEXT;`);
            } catch (e) {
                console.error("Error adding categoryId to debts:", e);
            }
            currentDbVersion = 4;
        }

        if (currentDbVersion === 4 || currentDbVersion === 5) {
            // Migration to v6: Force fix wishlist table (dropping old title-based table)
            console.log("Forcing wishlist table migration to v6...");
            await db.execAsync(`
                DROP TABLE IF EXISTS wishlist;
                CREATE TABLE wishlist (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    price TEXT,
                    color TEXT,
                    icon TEXT,
                    cost TEXT,
                    targetDate TEXT,
                    progress REAL DEFAULT 0,
                    commitments TEXT,
                    image TEXT,
                    url TEXT
                );
            `);
            currentDbVersion = 6;
        }

        if (currentDbVersion === 6) {
            // Migration to v7: Add profile table
            await db.execAsync(`
                CREATE TABLE IF NOT EXISTS profile (
                    id INTEGER PRIMARY KEY DEFAULT 1,
                    firstName TEXT,
                    lastName TEXT,
                    email TEXT,
                    phone TEXT,
                    password TEXT
                );
                INSERT OR IGNORE INTO profile (id, firstName, lastName, email, phone, password)
                VALUES (1, 'Ryan Reimann', 'Layno', 'ryan.layno@example.com', '0917 123 4567', 'password123');
            `);
            currentDbVersion = 7;
        }

        if (currentDbVersion === 7) {
            // Migration to v8: Add image column to transactions
            try {
                await db.execAsync(`ALTER TABLE transactions ADD COLUMN image TEXT;`);
            } catch (e) {
                console.error("Error adding image to transactions:", e);
            }
            currentDbVersion = 8;
        }

        await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
        console.log("Database migrated to version", DATABASE_VERSION);


    } catch (error) {
        console.error("Migration error:", error);
    }
}

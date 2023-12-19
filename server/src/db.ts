import { readConfigFile } from "./readConfigData.js";
import * as mysql from "mysql2";

const config = readConfigFile();

const pool = mysql.createPool(config.database);

export async function setupConnectionWithDB() {
    pool.getConnection(async (error, connection) => {
        if (error) return console.error("Error connecting to the database:", error);
    
        console.log(`Success connection do database`);
    
        try {
            const users: string = `
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(255),
                    password VARCHAR(255)
                );`;

            await executeQuery(users);
        } catch (err) {
            console.error("Error executing query:", err);
        } finally {
            connection.release();
        }
    });
}

export async function executeQuery<T>(query: string, values?: any[]): Promise<T[]> {
    return new Promise<T[]>((resolve, reject) => {
        pool.query(query, values, (error, results: any) => {
            if (error) {
                console.error(`Error while querying DB, query = ${query}, values = ${JSON.stringify(values)}, err = ${JSON.stringify(error)}`);
                reject(error);
            } else {
                resolve(Array.isArray(results) ? (results as T[]) : [results as T]);
            }
        });
    });
}
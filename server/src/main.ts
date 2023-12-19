import * as fs from "fs";
import express, { Request, Response } from "express";
import cors from "cors";
import http from "http";
import { fileURLToPath } from "url";
import path from "path";
import { readConfigFile } from "./readConfigData.js";
import { executeQuery, setupConnectionWithDB } from "./db.js";
import * as bcrypt from "bcrypt";
import { User } from "./interfaces.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const config = readConfigFile();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, "..", "src")));

server.listen(config.serverPort, async() => {
    await setupConnectionWithDB();
    await getRoutes();
    console.log(`Node server is running at port: ${config.serverPort}`);
});

const getRoutes = async() => {
    app.get("/", (req: Request, res: Response) => {
        res.sendFile(
            path.join(__dirname, "..", "src", "html", "index.html")
        );
    });

    app.post("/login", async(req: Request, res: Response) => {
        const { login, password } = req.body;

        try {
            const result = await executeQuery(`SELECT * FROM users WHERE username="${login}"`) as User[];

            if(result.length == 0) return res.send("No users found");

            await bcrypt.compare(password, result[0].password, (err, _result) => {
                if(_result) 
                    return res.send("Success authorization");

                return res.send("Unsuccessfully authorization");
            });
        } catch(er) {
            res.send("No users found");
        }
    });

    app.post("/reg", async(req: Request, res: Response) => {
        const { login, password } = req.body;

        const hashedPass = await bcrypt.hash(password, 8);

        try {
            await executeQuery(`INSERT INTO users (username, password) VALUES ("${login}", "${hashedPass}")`);
            res.send("Succes");
        } catch(e) {
            res.send(`Error: ${e}`);
        }
    });
}
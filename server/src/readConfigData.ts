import * as fs from "fs";

export const readConfigFile = () => {
    let config;
    try {
        const configFileContents = fs.readFileSync("./config.json", "utf8");
        config = JSON.parse(configFileContents);
    } catch (error) {
        console.error("Error reading config file:", (error as Error).message);
    }
    return config;
};

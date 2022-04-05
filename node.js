import express, { urlencoded, json } from "express"; // Import Express
import cors from "cors"; // Import Cors

const startServer = async () => {
    const app = express(); // Express app intialization

    app.use(express.static('public')); // Define static path

    app.enable('trust proxy', 1); // For nginx backed nodejs servers

    // const corsOptions = {
    //     origin: 'http://localhost:4200', // Read dynamic cors URL from .env
    //     preflightContinue: true,
    //     credentials: true,
    //     optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
    // }

    // app.use(cors(corsOptions)); // Cors policy

    // App listening based on env setup ( ** Check .env/config files for clarification)
    app.listen(3000, err => {
        if (err) {
            console.log(err);
            return;
        }
        console.log("Server running on port " + 3000 + " !");
    });
}



startServer(); // Start the Node server.
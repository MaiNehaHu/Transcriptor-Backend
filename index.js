// express

// models -> script, character
// character belongs to a script.
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8000;

const scriptRoutes = require("./routes/script");
const characterRoutes = require("./routes/character");

app.use("/api/scripts", scriptRoutes);
app.use("/api/characters", characterRoutes);

app.use("/", (req, res) => {
	res.send("Dictator server is running");
});

const startServer = async (req, res) => {
	try {
		await connectDB();

		app.listen(PORT, () => {
			console.log(`Server is running on port ${PORT}`);
		});
	} catch (error) {
		console.log(error);
		process.exit(1);
	}
};

startServer();

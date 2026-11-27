const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.use(async (req, res, next) => {
	try {
		await connectDB();

		next();
	} catch (error) {
		console.log(error);
		process.exit(1);
	}
});

const scriptRoutes = require("./routes/script");
const characterRoutes = require("./routes/character");

app.use("/api/scripts", scriptRoutes);
app.use("/api/characters", characterRoutes);

app.use("/", (req, res) => {
	res.send("Dictator server is running");
});

if (require.main === module) {
	const PORT = process.env.PORT || 8000;

	app.listen(PORT, () => {
		console.log(`Server is runnning on port ${PORT}`);
	});
}

module.exports = app;

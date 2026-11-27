const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
require("dotenv").config();

const app = express();

app.use(
	cors({
		origin: "https://transcriptor-azure.vercel.app",
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
		credentials: true,
	}),
);

app.use(express.json());

app.use(async (req, res, next) => {
	try {
		await connectDB();

		next();
	} catch (error) {
		console.log("Database connection failed: ", error);

		return res.status(500).json({
			message: "Database connection failed",
		});
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

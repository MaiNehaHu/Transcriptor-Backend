const mongoose = require("mongoose");

const characterSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		role: {
			type: String,
			required: true,
			trim: true,
		},
		scriptId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Script",
			required: true,
		},
	},
	{
		timestamps: true,
	},
);

characterSchema.index({ scriptId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Character", characterSchema);

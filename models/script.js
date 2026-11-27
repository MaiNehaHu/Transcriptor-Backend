const mongoose = require("mongoose");

const scriptSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true,
			unique: true,
		},
		content: {
			type: mongoose.Schema.Types.Mixed,
			default: {
				type: "doc",
				content: [
					{
						type: "paragraph",
					},
				],
			},
		},
		titleLocked: {
			type: Boolean,
			default: false,
		},
		titleLockExpiresAt: {
			type: Date,
			default: null,
		},
		// browser
		titleLockedBy: {
			type: String,
			default: null,
		},
		version: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
	},
);

module.exports = mongoose.model("Script", scriptSchema);

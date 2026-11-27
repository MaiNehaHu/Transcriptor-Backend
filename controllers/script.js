const Script = require("../models/script.js");
const mongoose = require("mongoose");

const createScript = async (req, res) => {
	try {
		const { title } = req.body;

		if (!title || !title.trim()) {
			return res.status(400).json({ message: "Title is required" });
		}

		const script = await Script.create({ title: title.trim() });

		res.status(201).json({
			message: "Script created successfully",
			data: script,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

const getAllScripts = async (req, res) => {
	try {
		const scripts = await Script.find().sort({
			updatedAt: -1,
		});

		res.status(200).json({
			message: "Scripts retrieved successfully",
			data: scripts,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

const getScriptById = async (req, res) => {
	try {
		const { scriptId } = req.params;

		if (!mongoose.Types.ObjectId.isValid(scriptId)) {
			return res.status(400).json({ message: "Invalid script scriptId" });
		}

		const script = await Script.findById(scriptId);

		if (!script) {
			return res.status(404).json({ message: "Script not found" });
		}

		res.status(200).json({
			message: "Script retrieved by Id successfully",
			data: script,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// updating or writting into script
const updateScriptContent = async (req, res) => {
	try {
		const { scriptId } = req.params;
		const { content, expectedVersion } = req.body;

		if (!mongoose.Types.ObjectId.isValid(scriptId)) {
			return res.status(400).json({ message: "Invalid script scriptId" });
		}

		if (content == undefined) {
			return res.status(400).json({ message: "Content is required" });
		}

		if (!Number.isInteger(expectedVersion)) {
			return res.status(400).json({
				message: "Expected version required for content update",
			});
		}

		const script = await Script.findOneAndUpdate(
			{ _id: scriptId, version: expectedVersion },
			{
				$set: { content: content },
				$inc: { version: 1 },
			},
			{ returnDocument: "after" },
		);

		if (!script) {
			const existingScript = await Script.findById(scriptId);

			if (!existingScript) {
				return res.status(404).json({ message: "Script not found" });
			}

			if (existingScript.version !== expectedVersion) {
				return res.status(409).json({
					message:
						"Version conflict. The script has been modified by another user. Refresh and try again.",
					currentVersion: existingScript.version,
					// data: existingScript,
				});
			}
		}

		res.status(200).json({
			message: "Script content updated successfully",
			data: script,
		});
	} catch (error) {
		console.log(error);

		res.status(500).json({
			message: "Server error to update content",
			error: error.message,
		});
	}
};

// lock not acquired/ acquired by another client
// lock acquired by this client
// version
const updateScriptTitle = async (req, res) => {
	try {
		const { scriptId } = req.params;
		const { title, clientId, expectedVersion } = req.body;

		if (!mongoose.Types.ObjectId.isValid(scriptId)) {
			return res.status(400).json({ message: "Invalid scriptId" });
		}

		if (typeof title !== "string" || !title.trim()) {
			return res.status(400).json({ message: "Title cannot be empty" });
		}

		if (
			!clientId ||
			clientId == null ||
			typeof clientId !== "string" ||
			!clientId.trim()
		) {
			return res.status(400).json({
				message: "Client ID is required for title update",
			});
		}

		if (!Number.isInteger(expectedVersion)) {
			return res.status(400).json({
				message: "Expected version required for title update",
			});
		}

		const script = await Script.findOneAndUpdate(
			{
				_id: scriptId,
				version: expectedVersion,
				titleLockedBy: clientId,
				titleLocked: true,
				titleLockExpiresAt: { $gt: new Date() }, // lock must be valid
			},
			{
				$set: { title: title.trim() },
				$inc: { version: 1 },
			},
			{ returnDocument: "after" },
		);

		if (!script) {
			const existingScript = await Script.findById(scriptId);

			if (!existingScript) {
				return res.status(404).json({ message: "Script not found" });
			}

			if (existingScript.version !== expectedVersion) {
				return res.status(409).json({
					message:
						"Version conflict. The script has been modified by another user. Refresh and try again.",
					currentVersion: existingScript.version,
					// data: existingScript,
				});
			}

			if (
				existingScript.titleLocked &&
				existingScript.titleLockedBy !== clientId &&
				existingScript.titleLockExpiresAt > new Date()
			) {
				return res.status(423).json({
					message: "Title is currently locked by another user",
					data: existingScript,
				});
			}

			return res
				.status(409)
				.json({ message: "Script is not locked by this client" });
		}

		res.status(200).json({
			message: "Script title updated successfully",
			data: script,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

const deletScript = async (req, res) => {
	try {
		const { scriptId } = req.params;

		if (!mongoose.Types.ObjectId.isValid(scriptId)) {
			return res.status(400).json({ message: "Invalid script scriptId" });
		}

		const script = await Script.findByIdAndDelete(scriptId);

		if (!script) {
			return res.status(404).json({ message: "Script not found" });
		}

		res.status(200).json({
			message: "Script deleted successfully",
			data: script,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

const aquireTitleLock = async (req, res) => {
	try {
		const { scriptId } = req.params;
		const { clientId } = req.body; // generated by the client in frontend
		// each browser will have different client Id

		if (!mongoose.Types.ObjectId.isValid(scriptId)) {
			return res.status(400).json({ message: "Invalid script scriptId" });
		}

		if (
			!clientId ||
			clientId == null ||
			typeof clientId !== "string" ||
			!clientId.trim()
		) {
			return res.status(400).json({ message: "Client ID is required" });
		}

		const script = await Script.findOneAndUpdate(
			{
				_id: scriptId,
				$or: [
					{ titleLocked: false },
					{ titleLocked: { $exists: false } },
					{ titleLockExpiresAt: { $lte: new Date() } },
					{ titleLockedBy: clientId },
				],
			},
			{
				$set: {
					titleLocked: true,
					titleLockExpiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
					titleLockedBy: clientId,
				},
			},
			{
				returnDocument: "after",
			},
		);

		if (!script) {
			const existingScript = await Script.exists({ _id: scriptId });

			if (!existingScript) {
				return res.status(404).json({ message: "Script not found" });
			}

			return res
				.status(409)
				.json({ message: "Title is currently locked by another user" });
		}

		return res.status(200).json({
			message: "Title lock acquired successfully",
			data: script,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			message: "Failed to release title lock",
			error: error.message,
		});
	}
};

const releaseTitleLock = async (req, res) => {
	try {
		const { scriptId } = req.params;
		const { clientId } = req.body;

		if (!mongoose.Types.ObjectId.isValid(scriptId)) {
			return res.status(400).json({ message: "Invalid script scriptId" });
		}

		const script = await Script.findOneAndUpdate(
			{
				_id: scriptId,
				titleLockedBy: clientId,
			},
			{
				$set: {
					titleLocked: false,
					titleLockExpiresAt: null,
					titleLockedBy: null,
				},
			},
			{
				returnDocument: "after",
			},
		);

		if (!script) {
			return res.status(404).json({
				message: "Script not found or lock not held by this client",
			});
		}

		return res.status(200).json({
			message: "Title lock released successfully",
			data: script,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			message: "Failed to release title lock",
			error: error.message,
		});
	}
};

module.exports = {
	createScript,
	getAllScripts,
	getScriptById,
	updateScriptContent,
	updateScriptTitle,
	deletScript,
	aquireTitleLock,
	releaseTitleLock,
};

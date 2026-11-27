const Script = require("../models/Script");
const Character = require("../models/Character");
const mongoose = require("mongoose");

const getCharactersOfScript = async (req, res) => {
	try {
		const { scriptId } = req.params;

		if (!mongoose.Types.ObjectId.isValid(scriptId)) {
			return res.status(400).json({ message: "Invalid scriptId" });
		}

		const script = await Script.findById(scriptId);

		if (!script) {
			return res.status(404).json({
				message: "Script not found",
			});
		}

		const characters = await Character.find({ scriptId }).sort({
			createdAt: 1,
		});

		return res.status(200).json({
			message: "Characters fetched successfully",
			data: characters,
		});
	} catch (error) {
		console.log(error);

		res.status(500).json({
			message: "Failed to create character",
			error: error.message,
		});
	}
};

const getCharacterById = async (req, res) => {
	try {
		const { characterId } = req.params;

		if (!mongoose.Types.ObjectId.isValid(characterId)) {
			return res.status(400).json({ message: "Invalid characterId" });
		}

		const character = await Character.findById(characterId);

		if (!character) {
			return res.status(404).json({
				message: "Character not found",
			});
		}

		return res.status(200).json({
			message: "Character fetched successfully",
			data: character,
		});
	} catch (error) {
		console.log(error);

		res.status(500).json({
			message: "Failed to create character",
			error: error.message,
		});
	}
};

const createCharacter = async (req, res) => {
	try {
		const { scriptId } = req.params;
		const { name, role } = req.body;

		if (!mongoose.Types.ObjectId.isValid(scriptId)) {
			return res.status(400).json({ message: "Invalid scriptId" });
		}

		if (!name || !role) {
			return res
				.status(400)
				.json({ message: "Name and role are required" });
		}

		const existingScript = await Script.findById(scriptId);

		if (!existingScript) {
			return res.status(404).json({ message: "Script not found" });
		}

		const newCharacter = new Character({
			name: name.trim(),
			role: role.trim(),
			scriptId,
		});

		const savedCharacter = await newCharacter.save();

		res.status(201).json({
			message: "Character created successfully",
			data: savedCharacter,
		});
	} catch (error) {
		console.log(error);

		if (error.code === 11000) {
			return res.status(409).json({
				message: "Character with same name exists",
				error: error.message,
			});
		}

		return res.status(500).json({
			message: "Failed to create character",
			error: error.message,
		});
	}
};

const editCharacter = async (req, res) => {
	try {
		const { scriptId, characterId } = req.params;
		const { name, role } = req.body;

		if (
			!mongoose.Types.ObjectId.isValid(scriptId) ||
			!mongoose.Types.ObjectId.isValid(characterId)
		) {
			return res
				.status(400)
				.json({ message: "Invalid scriptId or characterId" });
		}

		if ((!name || !name.trim()) && (!role || !role.trim())) {
			return res.status(400).json({
				message: "Name or role is empty",
			});
		}

		const updates = {};

		if (name != undefined) {
			if (typeof name != "string" || !name.trim()) {
				return res.status(400).json({ message: "Invalid name" });
			}

			updates.name = name.trim();
		}

		if (role != undefined) {
			if (typeof role != "string" || !role.trim()) {
				return res.status(400).json({ message: "Invalid role" });
			}

			updates.role = role.trim();
		}

		const character = await Character.findOneAndUpdate(
			{ _id: characterId, scriptId },
			{
				$set: updates,
			},
			{ returnDocument: "after", runValidators: true },
		);

		if (!character) {
			return res.status(404).json({
				message: "Character not found in script",
			});
		}

		return res.status(200).json({
			message: "Character updated successfully!!",
		});
	} catch (error) {
		console.log(error);

		if (error.code === 11000) {
			res.status(409).json({
				message: "Character with same name exists",
				error: error.message,
			});
		}

		res.status(500).json({
			message: "Failed to edit character",
			error: error.message,
		});
	}
};

const deleteCharacter = async (req, res) => {
	try {
		const { scriptId, characterId } = req.params;

		if (
			!mongoose.Types.ObjectId.isValid(scriptId) ||
			!mongoose.Types.ObjectId.isValid(characterId)
		) {
			return res
				.status(400)
				.json({ message: "Invalid scriptId or characterId" });
		}

		const character = await Character.findOneAndDelete({
			_id: characterId,
			scriptId,
		});

		if (!character) {
			return res.status(404).json({
				message: "Character not found",
			});
		}

		return res.status(200).json({
			message: "Character deleted successfully!!",
		});
	} catch (error) {
		res.status(500).json({
			message: "Failed to delete character",
			error: error.message,
		});
	}
};

module.exports = {
	createCharacter,
	editCharacter,
	deleteCharacter,
	getCharactersOfScript,
	getCharacterById,
};

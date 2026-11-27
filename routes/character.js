const express = require("express");
const {
	getCharactersOfScript,
	getCharacterById,
} = require("../controllers/character");

const router = express.Router();

router.get("/:scriptId", getCharactersOfScript);
router.get("/character/:characterId", getCharacterById);

module.exports = router;

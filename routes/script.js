const express = require("express");
const {
	getAllScripts,
	createScript,
	getScriptById,
	updateScriptContent,
	updateScriptTitle,
	deletScript,
	aquireTitleLock,
	releaseTitleLock,
} = require("../controllers/script");
const {
	createCharacter,
	editCharacter,
	deleteCharacter,
} = require("../controllers/character");

const router = express.Router();

router.get("/", getAllScripts);
router.post("/", createScript);
router.get("/:scriptId", getScriptById);
router.patch("/:scriptId/content", updateScriptContent);
router.patch("/:scriptId/title", updateScriptTitle);
router.delete("/:scriptId", deletScript);
router.post("/:scriptId/title-lock", aquireTitleLock);
router.delete("/:scriptId/title-lock", releaseTitleLock);

// characters
router.post("/:scriptId", createCharacter);
router.put("/:scriptId/characters/:characterId", editCharacter);
router.delete("/:scriptId/characters/:characterId", deleteCharacter);

module.exports = router;

const { handleGateway } = require("../../vercel/ai-gateway");

module.exports = (req, res) => handleGateway(req, res, "getModels");

import app from "./app";
import logger from "./utils/logger";

const PORT = parseInt(process.env["PORT"] ?? "3000", 10);
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));

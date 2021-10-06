import path from "path";
import { Storage } from "@tweedegolf/storage-abstraction";

const templatePath =
  process.env.TEMPLATE_URL ||
  `local://${path.join(__dirname, "..", "templates")}`;
const storage = new Storage(templatePath);

export default storage;

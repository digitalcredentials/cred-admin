import { Storage } from "@tweedegolf/storage-abstraction";
import config from "./config";

const storage = new Storage(config.templateUrl);

export default storage;

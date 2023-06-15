import { client, runningSetup } from "../stores/database";
import { connect } from "./database/connection";

export const setupDatabase = async () => {
    runningSetup.set(true);

    client.set(await connect());

    runningSetup.set(false);
};

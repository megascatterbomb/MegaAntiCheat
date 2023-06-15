import mongoose from "mongoose";

export interface ConnectionParams {
    host: string;
    port: number;

    username?: string;
    password?: string;

    database: string;
}

export const defaultConnectionParams: ConnectionParams = {
    host: "localhost",
    port: 27017,

    database: "megaanticheat-dev",
};

export const connect = async (params?: Partial<ConnectionParams>) => {
    const options = {
        ...defaultConnectionParams,
        ...params,
    };

    return await mongoose.connect(`mongodb://${options.host}:${options.port}/${options.database}`, {
        ...(options.username &&
            options.password && {
                auth: {
                    username: options.username,
                    password: options.password,
                },
            }),
    });
};

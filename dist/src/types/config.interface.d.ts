export interface IConfig {
    appName: string;
    appMail: string;
    appPassword: string;
    database: {
        host: string;
        port: number;
        user: string;
        password: string;
        database: string;
    };
}

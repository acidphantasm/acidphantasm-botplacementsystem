import { inject, injectable } from "tsyringe";
import { FileSystemSync } from "@spt/utils/FileSystemSync";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import path from "node:path";

@injectable()
export class ModConfig
{
    public static config: Config;
    private lol: string;

    constructor(
        @inject("PrimaryLogger") protected logger: ILogger,
        @inject("FileSystemSync") protected fileSystemSync: FileSystemSync
    )
    {
        ModConfig.config = this.fileSystemSync.readJson(path.resolve(__dirname, "../../config/config.json"));
    }
}
export interface Config
{
    enabled: boolean
}
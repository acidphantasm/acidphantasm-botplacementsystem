// SPT
import { DependencyContainer, Lifecycle } from "tsyringe";
import { PreSptModLoader } from "@spt/loaders/PreSptModLoader";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { StaticRouterModService } from "@spt/services/mod/staticRouter/StaticRouterModService";
import { DynamicRouterModService } from "@spt/services/mod/dynamicRouter/DynamicRouterModService";
import { DatabaseService } from "@spt/services/DatabaseService";
import { IDatabaseTables } from "@spt/models/spt/server/IDatabaseTables";
import { ConfigServer } from "@spt/servers/ConfigServer";
import { FileSystemSync } from "@spt/utils/FileSystemSync";

// Custom
import { ModConfig } from "./Globals/ModConfig";

export class InstanceManager 
{
    //#region accessible in or after preSptLoad
    public modName: string;
    public container: DependencyContainer;
    public preSptModLoader: PreSptModLoader;
    public logger: ILogger;
    public fileSystemSync: FileSystemSync;

    public modConfig: ModConfig;
    //#endregion

    //#region accessible in or after postDBLoad
    public tables: IDatabaseTables;
    //#endregion

    //#region accessible in or after PostSptLoad

    //#endregion

    // Call at the start of the mods postDBLoad method
    public preSptLoad(container: DependencyContainer, mod: string): void
    {
        this.modName = mod;
        this.container = container;

        // SPT Classes
        this.preSptModLoader = container.resolve<PreSptModLoader>("PreSptModLoader");
        this.logger = container.resolve<ILogger>("WinstonLogger");
        this.fileSystemSync = container.resolve<FileSystemSync>("FileSystemSync");

        // Custom Classes
        //this.container.register<ModInformation>("ModInformation", ModInformation, { lifecycle: Lifecycle.Singleton })
        //this.modInformation = container.resolve<ModInformation>("ModInformation");

        // Custom Special

        // Class Extension Override
        //this.container.register<APBSBotGenerator>("APBSBotGenerator", APBSBotGenerator);
        //this.container.register("BotGenerator", { useToken: "APBSBotGenerator" });
        
        // Resolve this last to set mod configs
        this.container.register<ModConfig>("ModConfig", ModConfig, { lifecycle: Lifecycle.Singleton })
        this.modConfig = container.resolve<ModConfig>("ModConfig");
    }

    public postDBLoad(container: DependencyContainer): void
    {
        // SPT Classes
        this.tables = container.resolve<DatabaseService>("DatabaseService").getTables();
    }

    public postSptLoad(container: DependencyContainer): void
    {
        // SPT Classes
        this.tables = container.resolve<DatabaseService>("DatabaseService").getTables();
    }
}
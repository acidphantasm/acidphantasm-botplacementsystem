// SPT
import { DependencyContainer, Lifecycle } from "tsyringe";
import { PreSptModLoader } from "@spt/loaders/PreSptModLoader";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { StaticRouterModService } from "@spt/services/mod/staticRouter/StaticRouterModService";
import { DatabaseService } from "@spt/services/DatabaseService";
import { FileSystemSync } from "@spt/utils/FileSystemSync";

// Custom
import { ModConfig } from "./Globals/ModConfig";
import { MapSpawnControl } from "./Controls/MapSpawnControl";
import { BossSpawnControl } from "./Controls/BossSpawnControl";
import { ICloner } from "@spt/utils/cloners/ICloner";
import { VanillaAdjustmentControl } from "./Controls/VanillaAdjustmentControl";
import { PMCSpawnControl } from "./Controls/PMCSpawnControl";
import { StaticRouterHooks } from "./Routers/StaticRouterHooks";
import { WeightedRandomHelper } from "@spt/helpers/WeightedRandomHelper";
import { ScavSpawnControl } from "./Controls/ScavSpawnControl";

export class InstanceManager 
{
    //#region accessible in or after preSptLoad
    public modName: string;
    public container: DependencyContainer;
    public preSptModLoader: PreSptModLoader;
    public logger: ILogger;
    public fileSystemSync: FileSystemSync;
    public cloner: ICloner;
    public staticRouterModService: StaticRouterModService;

    public staticRouterHooks: StaticRouterHooks;
    public modConfig: ModConfig;
    //#endregion

    //#region accessible in or after postDBLoad
    public databaseService: DatabaseService;
    public weightedRandomHelper: WeightedRandomHelper;
    public vanillaAdjustmentControl: VanillaAdjustmentControl;
    public bossSpawnControl: BossSpawnControl;
    public pmcSpawnControl: PMCSpawnControl;
    public scavSpawnControl: ScavSpawnControl;
    public mapSpawnControl: MapSpawnControl;
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
        this.cloner = container.resolve<ICloner>("PrimaryCloner");
        this.staticRouterModService = container.resolve<StaticRouterModService>("StaticRouterModService");

        // Custom Classes
        this.container.register<VanillaAdjustmentControl>("VanillaAdjustmentControl", VanillaAdjustmentControl, { lifecycle: Lifecycle.Singleton })
        this.container.register<BossSpawnControl>("BossSpawnControl", BossSpawnControl, { lifecycle: Lifecycle.Singleton })
        this.container.register<ScavSpawnControl>("ScavSpawnControl", ScavSpawnControl, { lifecycle: Lifecycle.Singleton })
        this.container.register<PMCSpawnControl>("PMCSpawnControl", PMCSpawnControl, { lifecycle: Lifecycle.Singleton })
        this.container.register<MapSpawnControl>("MapSpawnControl", MapSpawnControl, { lifecycle: Lifecycle.Singleton })

        this.container.register<StaticRouterHooks>("StaticRouterHooks", StaticRouterHooks, { lifecycle: Lifecycle.Singleton })
        this.staticRouterHooks = container.resolve<StaticRouterHooks>("StaticRouterHooks");

        // Custom Special
        
        // Resolve this last to set mod configs
        this.container.register<ModConfig>("ModConfig", ModConfig, { lifecycle: Lifecycle.Singleton })
        this.modConfig = container.resolve<ModConfig>("ModConfig");
    }

    public postDBLoad(container: DependencyContainer): void
    {
        // SPT Classes
        this.databaseService = container.resolve<DatabaseService>("DatabaseService");
        this.weightedRandomHelper = container.resolve<WeightedRandomHelper>("WeightedRandomHelper");
        this.vanillaAdjustmentControl = container.resolve<VanillaAdjustmentControl>("VanillaAdjustmentControl");
        this.bossSpawnControl = container.resolve<BossSpawnControl>("BossSpawnControl");
        this.scavSpawnControl = container.resolve<ScavSpawnControl>("ScavSpawnControl");
        this.pmcSpawnControl = container.resolve<PMCSpawnControl>("PMCSpawnControl");
        this.mapSpawnControl = container.resolve<MapSpawnControl>("MapSpawnControl");
    }

    public postSptLoad(container: DependencyContainer): void
    {
        // SPT Classes
        this.databaseService = container.resolve<DatabaseService>("DatabaseService");
    }
}
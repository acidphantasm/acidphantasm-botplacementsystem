import { injectable, inject } from "tsyringe";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { ConfigServer } from "@spt/servers/ConfigServer";
import { DatabaseService } from "@spt/services/DatabaseService";
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";
import { ILocationConfig } from "@spt/models/spt/config/ILocationConfig";
import { ILocationBase, IWave } from "@spt/models/eft/common/ILocationBase";
import { newPMCHostilitySettings } from "../Defaults/Hostility";
import { ICloner } from "@spt/utils/cloners/ICloner";
import { IPmcConfig } from "@spt/models/spt/config/IPmcConfig";
import { IBotConfig } from "@spt/models/spt/config/IBotConfig";
import { ILocation } from "@spt/models/eft/itemEvent/IItemEventRouterRequest";

@injectable()
export class VanillaAdjustmentControl
{
    public locationConfig: ILocationConfig;
    public pmcConfig: IPmcConfig;
    public botConfig: IBotConfig;

    constructor(
        @inject("WinstonLogger") protected logger: ILogger,
        @inject("DatabaseService") protected databaseService: DatabaseService,
        @inject("ConfigServer") protected configServer: ConfigServer,
        @inject("PrimaryCloner") protected cloner: ICloner
    )
    {
        this.locationConfig = this.configServer.getConfig<ILocationConfig>(ConfigTypes.LOCATION);
        this.pmcConfig = this.configServer.getConfig<IPmcConfig>(ConfigTypes.PMC);
        this.botConfig = this.configServer.getConfig<IBotConfig>(ConfigTypes.BOT);
    }

    public disableVanillaSettings(): void
    {
        this.locationConfig.splitWaveIntoSingleSpawnsSettings.enabled = false;
        this.locationConfig.rogueLighthouseSpawnTimeSettings.enabled = false;
        this.locationConfig.addOpenZonesToAllMaps = false;
        this.locationConfig.addCustomBotWavesToMaps = false;
        this.locationConfig.enableBotTypeLimits = false;
    }

    public disableNewSpawnSystem(base: any): void
    {
        base.NewSpawn = false;
        base.OfflineNewSpawn = false;
        base.OldSpawn = true;
        base.OfflineOldSpawn = true;
    }

    public enableAllSpawnSystem(base: any): void
    {
        base.NewSpawn = true;
        base.OfflineNewSpawn = true;
        base.OldSpawn = true;
        base.OfflineOldSpawn = true;
    }

    public disableWaves(base: any): void
    {
        base.waves = [];
    }

    public fixPMCHostility(base: ILocationBase): void
    {
        const hostility = base.BotLocationModifier?.AdditionalHostilitySettings;
        if (hostility)
        {
            for (const bot in hostility)
            {
                if (hostility[bot].BotRole == "pmcUSEC" || hostility[bot].BotRole == "pmcBEAR")
                {
                    const newHostilitySettings = this.cloner.clone(newPMCHostilitySettings);
                    newHostilitySettings.BotRole = hostility[bot].BotRole;
                    hostility[bot] = newHostilitySettings;
                }
            }
        }
    }

    public removeCustomPMCWaves(): void
    {
        this.pmcConfig.removeExistingPmcWaves = false;
        this.pmcConfig.customPmcWaves = {};
    }
}
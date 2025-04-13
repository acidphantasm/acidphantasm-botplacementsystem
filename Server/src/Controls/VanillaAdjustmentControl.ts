import { injectable, inject } from "tsyringe";
import type { ILogger } from "@spt/models/spt/utils/ILogger";
import { ConfigServer } from "@spt/servers/ConfigServer";
import { DatabaseService } from "@spt/services/DatabaseService";
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";
import { ILocationConfig } from "@spt/models/spt/config/ILocationConfig";
import { ILocationBase } from "@spt/models/eft/common/ILocationBase";
import { newPMCHostilitySettings } from "../Defaults/Hostility";
import type { ICloner } from "@spt/utils/cloners/ICloner";
import { IPmcConfig } from "@spt/models/spt/config/IPmcConfig";
import { IBotConfig } from "@spt/models/spt/config/IBotConfig";
import { ModConfig } from "../Globals/ModConfig";

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

    public changeBotCaps(): void
    {
        this.botConfig.maxBotCap.factory4_day = 13;
        this.botConfig.maxBotCap.factory4_night = 13;
        this.botConfig.maxBotCap.sandbox = 17;
        this.botConfig.maxBotCap.sandbox_high = 17;
    }

    public disableNewSpawnSystem(base: any): void
    {
        if (base.Id == "laboratory") return;

        base.NewSpawn = false;
        base.OfflineNewSpawn = false;
        base.OldSpawn = true;
        base.OfflineOldSpawn = true;
    }

    public enableAllSpawnSystem(base: any): void
    {
        if (base.Id == "laboratory") return;

        base.NewSpawn = true;
        base.OfflineNewSpawn = true;
        base.OldSpawn = true;
        base.OfflineOldSpawn = true;
    }

    public adjustNewWaveSettings(base: any): void
    {
        if (base.Id == "laboratory") return;

        // Start-Stop Time for spawns
        base.BotStart = ModConfig.config.scavConfig.waves.startSpawns;
        base.BotStop = (base.EscapeTimeLimit * 60) - ModConfig.config.scavConfig.waves.stopSpawns;

        // Start-Stop wave times for active spawning
        base.BotSpawnTimeOnMin = ModConfig.config.scavConfig.waves.activeTimeMin;
        base.BotSpawnTimeOnMax = ModConfig.config.scavConfig.waves.activeTimeMax;

        // Start-Stop wave wait times between active spawning
        base.BotSpawnTimeOffMin = ModConfig.config.scavConfig.waves.quietTimeMin;
        base.BotSpawnTimeOffMax = ModConfig.config.scavConfig.waves.quietTimeMax;

        // Probably how often it checks to spawn while active spawning
        base.BotSpawnPeriodCheck = ModConfig.config.scavConfig.waves.checkToSpawnTimer;

        // Bot count required to trigger a spawn
        base.BotSpawnCountStep = ModConfig.config.scavConfig.waves.pendingBotsToTrigger;

        base.BotLocationModifier.NonWaveSpawnBotsLimitPerPlayer = 100;
        base.BotLocationModifier.NonWaveSpawnBotsLimitPerPlayerPvE = 100;
    }

    public removeExistingWaves(base: any): void
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
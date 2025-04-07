import { injectable, inject } from "tsyringe";
import { ILocationBase, IBossLocationSpawn, IWave } from "@spt/models/eft/common/ILocationBase";
import { ILogger } from "@spt/models/spt/utils/ILogger";

import { BossSpawnControl } from "./BossSpawnControl";
import { DatabaseService } from "@spt/services/DatabaseService";
import { ILocations } from "@spt/models/spt/server/ILocations";
import { VanillaAdjustmentControl } from "./VanillaAdjustmentControl";
import { PMCSpawnControl } from "./PMCSpawnControl";
import { ScavSpawnControl } from "./ScavSpawnControl";
import { IRaidChanges } from "@spt/models/spt/location/IRaidChanges";
import { ICloner } from "@spt/utils/cloners/ICloner";

@injectable()
export class MapSpawnControl 
{
    public validMaps: string[] = [
        "bigmap",
        "factory4_day",
        "factory4_night",
        "interchange",
        "laboratory",
        "lighthouse",
        "rezervbase",
        "sandbox",
        "sandbox_high",
        "shoreline",
        "tarkovstreets",
        "woods"
    ];

    public botMapCache: Record<string, IBossLocationSpawn[]> = {};
    public scavMapCache: Record<string, IWave[]> = {};
    public locationData: ILocations = {};

    constructor(
        @inject("WinstonLogger") protected logger: ILogger,
        @inject("DatabaseService") protected databaseService: DatabaseService,
        @inject("BossSpawnControl") protected bossSpawnControl: BossSpawnControl,
        @inject("ScavSpawnControl") protected scavSpawnControl: ScavSpawnControl,
        @inject("PMCSpawnControl") protected pmcSpawnControl: PMCSpawnControl,
        @inject("PrimaryCloner") protected cloner: ICloner,
        @inject("VanillaAdjustmentControl") protected vanillaAdjustmentControl: VanillaAdjustmentControl
    ) 
    {}

    public configureInitialData(): void 
    {
        this.locationData = this.databaseService.getTables().locations;
        for (const map in this.validMaps) 
        {
            const mapName = this.validMaps[map];
            this.locationData[mapName].base.BossLocationSpawn = [];
            this.botMapCache[mapName] = [];
            this.scavMapCache[mapName] = [];
            if (ModConfig.config.scavConfig.waves.enable) this.vanillaAdjustmentControl.enableAllSpawnSystem(this.locationData[mapName].base);
            this.vanillaAdjustmentControl.removeExistingWaves(this.locationData[mapName].base);
            this.vanillaAdjustmentControl.fixPMCHostility(this.locationData[mapName].base);
            this.vanillaAdjustmentControl.adjustNewWaveSettings(this.locationData[mapName].base);
            /*
            This is how you make a spawn point properly
            if (this.validMaps[map] == "bigmap") {
                const test = {
                    "BotZoneName": "",
                    "Categories": [
                        "Player"
                    ],
                    "ColliderParams": {
                        "_parent": "SpawnSphereParams",
                        "_props": {
                            "Center": {
                                "x": 0,
                                "y": 0,
                                "z": 0
                            },
                            "Radius": 75
                        }
                    },
                    "CorePointId": 0,
                    "DelayToCanSpawnSec": 4,
                    "Id": crypto.randomUUID(),
                    "Infiltration": "Boiler Tanks",
                    "Position": {
                        "x": 288.068,
                        "y": 1.718,
                        "z": -200.166
                    },
                    "Rotation": 17.73762,
                    "Sides": [
                        "Pmc"
                    ]
                }
                this.locationData[mapName].base.SpawnPointParams.push(test);
            }
            */
        }

        this.vanillaAdjustmentControl.disableVanillaSettings();
        this.vanillaAdjustmentControl.removeCustomPMCWaves();
        this.buildInitialCache();
    }
    public buildInitialCache(): void 
    {
        this.buildBossWaves();
        this.buildPMCWaves();
        this.buildStartingScavs();
        this.replaceOriginalLocations();
    }

    private buildBossWaves(): void 
    {
        for (const map in this.validMaps) 
        {
            const mapName = this.validMaps[map];
            this.logger.warning(`[ABPS] Creating boss waves for ${mapName}`);

            const mapData = this.bossSpawnControl.getCustomMapData(this.validMaps[map], this.locationData[mapName].base.EscapeTimeLimit);
            if (mapData.length) mapData.forEach((index) => (this.botMapCache[mapName].push(index)));
        }
    }

    private buildPMCWaves(): void 
    {
        for (const map in this.validMaps) 
        {
            const mapName = this.validMaps[map];
            this.logger.warning(`[ABPS] Creating pmc waves for ${mapName}`);

            const mapData = this.pmcSpawnControl.getCustomMapData(this.validMaps[map], this.locationData[mapName].base.EscapeTimeLimit);
            if (mapData.length) mapData.forEach((index) => (this.botMapCache[mapName].push(index)));
        }
    }

    private buildStartingScavs(): void 
    {
        this.logger.warning("[ABPS] Creating initial scav spawns");
        for (const map in this.validMaps) 
        {
            const mapName = this.validMaps[map];
            if (mapName == "laboratory") continue;

            const mapData = this.scavSpawnControl.getCustomMapData(this.validMaps[map]);
            if (mapData.length) mapData.forEach((index) => (this.scavMapCache[mapName].push(index)));
        }
    }

    private replaceOriginalLocations(): void 
    {
        for (const map in this.validMaps) 
        {
            const mapName = this.validMaps[map];
            this.locationData[mapName].base.BossLocationSpawn = this.cloner.clone(this.botMapCache[mapName]);
            this.locationData[mapName].base.waves = this.cloner.clone(this.scavMapCache[mapName]);
        }
    }

    public rebuildCache(location: string): void
    {
        this.locationData = this.databaseService.getTables().locations;
        this.botMapCache[location] = [];
        this.scavMapCache[location] = [];
        this.rebuildBossWave(location);
        this.rebuildPMCWave(location);    
        this.rebuildStartingScavs(location) 
        this.rebuildLocation(location);
    }

    private rebuildBossWave(location: string): void 
    {
        const mapName = location.toLowerCase();
        this.logger.warning(`[ABPS] Recreating boss waves for ${mapName}`);

        const mapData = this.bossSpawnControl.getCustomMapData(mapName, this.locationData[mapName].base.EscapeTimeLimit);
        if (mapData.length) mapData.forEach((index) => (this.botMapCache[mapName].push(index)));
    }

    private rebuildPMCWave(location: string): void 
    {
        const mapName = location.toLowerCase();
        this.logger.warning(`[ABPS] Recreating PMC waves for ${mapName}`);

        const mapData = this.pmcSpawnControl.getCustomMapData(mapName, this.locationData[mapName].base.EscapeTimeLimit);
        if (mapData.length) mapData.forEach((index) => (this.botMapCache[mapName].push(index)));
    }

    private rebuildStartingScavs(location: string): void 
    {
        const mapName = location.toLowerCase();
        if (mapName == "laboratory") return;
        this.logger.warning("[ABPS] Recreating starting scavs");

        const mapData = this.scavSpawnControl.getCustomMapData(mapName);
        if (mapData.length) mapData.forEach((index) => (this.scavMapCache[mapName].push(index)));
    }

    private rebuildLocation(location: string): void 
    {
        const mapName = location.toLowerCase();
        this.locationData[mapName].base.BossLocationSpawn = this.cloner.clone(this.botMapCache[mapName]);
        this.locationData[mapName].base.waves = this.cloner.clone(this.scavMapCache[mapName]);
    }

    public adjustWaves(mapBase: ILocationBase, raidAdjustments: IRaidChanges): void
    {
        const locationName = mapBase.Id.toLowerCase();
        if (raidAdjustments.simulatedRaidStartSeconds > 60)
        {
            const mapBosses = mapBase.BossLocationSpawn.filter((x) => x.Time == -1 && x.BossName != "pmcUSEC" && x.BossName != "pmcBEAR");
            console.log(mapBosses.length);
            mapBase.BossLocationSpawn = mapBase.BossLocationSpawn.filter((x) => x.Time > raidAdjustments.simulatedRaidStartSeconds && (x.BossName == "pmcUSEC" || x.BossName == "pmcBEAR"));

            for (const bossWave of mapBase.BossLocationSpawn)
            {
                bossWave.Time -= Math.max(raidAdjustments.simulatedRaidStartSeconds, 0);
            }

            const totalRemainingTime = raidAdjustments.raidTimeMinutes * 60;
            const newStartingPMCs = this.pmcSpawnControl.generateScavRaidRemainingPMCs(locationName, totalRemainingTime);
            newStartingPMCs.forEach((index) => (mapBase.BossLocationSpawn.push(index)));
            mapBosses.forEach((index) => (mapBase.BossLocationSpawn.push(index)));

            const newStartingScavs = this.scavSpawnControl.generateInitialScavsForRemainingRaidTime(locationName, "assault");
            newStartingScavs.forEach((index) => (mapBase.waves.push(index)));
        }
    }
}
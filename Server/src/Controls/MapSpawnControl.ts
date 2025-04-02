import { injectable, inject } from "tsyringe";
import { IBossLocationSpawn } from "@spt/models/eft/common/ILocationBase";
import { ILogger } from "@spt/models/spt/utils/ILogger";

import { BossSpawnControl } from "./BossSpawnControl";
import { DatabaseService } from "@spt/services/DatabaseService";
import { ConfigServer } from "@spt/servers/ConfigServer";
import { ILocations } from "@spt/models/spt/server/ILocations";
import { VanillaAdjustmentControl } from "./VanillaAdjustmentControl";
import { PMCSpawnControl } from "./PMCSpawnControl";

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
    public locationData: ILocations = {};

    constructor(
        @inject("WinstonLogger") protected logger: ILogger,
        @inject("DatabaseService") protected databaseService: DatabaseService,
        @inject("BossSpawnControl") protected bossSpawnControl: BossSpawnControl,
        @inject("PMCSpawnControl") protected pmcSpawnControl: PMCSpawnControl,
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
            this.vanillaAdjustmentControl.disableNewSpawnSystem(this.locationData[mapName].base);
            //this.vanillaAdjustmentControl.disableWaves(this.locationData[mapName].base);
            this.vanillaAdjustmentControl.fixPMCHostility(this.locationData[mapName].base);
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
        this.buildBossWave();
        this.buildPMCWave();
        this.replaceOriginalLocations();
    }

    private buildBossWave(): void 
    {
        this.logger.warning("[ABPS] Creating boss waves");
        for (const map in this.validMaps) 
        {
            const mapName = this.validMaps[map];

            const mapData = this.bossSpawnControl.getCustomMapData(this.validMaps[map]);
            if (mapData.length) mapData.forEach((index) => (this.botMapCache[mapName].push(index)));
        }
    }

    private buildPMCWave(): void 
    {
        this.logger.warning("[ABPS] Creating pmc waves");
        for (const map in this.validMaps) 
        {
            const mapName = this.validMaps[map];

            const mapData = this.pmcSpawnControl.getCustomMapData(this.validMaps[map], this.locationData[mapName].base.EscapeTimeLimit);
            if (mapData.length) mapData.forEach((index) => (this.botMapCache[mapName].push(index)));
        }
    }

    private replaceOriginalLocations(): void 
    {
        for (const map in this.validMaps) 
        {
            const mapName = this.validMaps[map];
            this.locationData[mapName].base.BossLocationSpawn = this.botMapCache[mapName];
        }
    }

    public rebuildCache(location: string): void
    {
        this.locationData = this.databaseService.getTables().locations;
        this.botMapCache[location] = [];
        this.rebuildBossWave(location);
        this.rebuildPMCWave(location);        
        this.rebuildLocation(location);
    }

    private rebuildBossWave(location: string): void 
    {
        this.logger.warning("[ABPS] Recreating boss waves");
        const mapName = location.toLowerCase();

        const mapData = this.bossSpawnControl.getCustomMapData(mapName);
        if (mapData.length) mapData.forEach((index) => (this.botMapCache[mapName].push(index)));
    }

    private rebuildPMCWave(location: string): void 
    {
        this.logger.warning("[ABPS] Recreating pmc waves");
        const mapName = location.toLowerCase();

        const mapData = this.pmcSpawnControl.getCustomMapData(mapName, this.locationData[mapName].base.EscapeTimeLimit);
        if (mapData.length) mapData.forEach((index) => (this.botMapCache[mapName].push(index)));
    }

    private rebuildLocation(location: string): void 
    {
        const mapName = location.toLowerCase();
        this.locationData[mapName].base.BossLocationSpawn = this.botMapCache[mapName];
        this.locationData[mapName].base.waves = this.cloner.clone(this.originalScavMapCache[mapName]);
        this.scavMapCache[mapName].forEach((index) => (this.locationData[mapName].base.waves.push(index)));
    }

    public adjustWaves(mapBase: ILocationBase, raidAdjustments: IRaidChanges): void
    {
        if (raidAdjustments.simulatedRaidStartSeconds > 60)
        {
            mapBase.BossLocationSpawn = mapBase.BossLocationSpawn.filter((x) => x.Time > raidAdjustments.simulatedRaidStartSeconds && (x.BossName == "pmcUSEC" || x.BossName == "pmcBEAR"));

            for (const bossWave of mapBase.BossLocationSpawn)
            {
                bossWave.Time -= Math.max(raidAdjustments.simulatedRaidStartSeconds, 0);
            }

            const totalRemainingTime = raidAdjustments.raidTimeMinutes * 60;
            const newStartingPMCs = this.pmcSpawnControl.generateScavRaidRemainingPMCs(mapBase.Id, totalRemainingTime);
            newStartingPMCs.forEach((index) => (mapBase.BossLocationSpawn.push(index)));
        }
    }
}
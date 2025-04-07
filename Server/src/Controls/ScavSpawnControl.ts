import { injectable, inject } from "tsyringe";
import { IBossLocationSpawn, IWave } from "@spt/models/eft/common/ILocationBase";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { ICloner } from "@spt/utils/cloners/ICloner";
import { RandomUtil } from "@spt/utils/RandomUtil";
import { WeightedRandomHelper } from "@spt/helpers/WeightedRandomHelper";


// Default Scav Data


import { ModConfig } from "../Globals/ModConfig";
import { scavData } from "../Defaults/Scavs";
import { DatabaseService } from "@spt/services/DatabaseService";
import { 
    Customs_SpawnZones, 
    Customs_SnipeSpawnZones,
    Factory_SpawnZones, 
    GroundZero_SpawnZones, 
    Interchange_SpawnZones, 
    Labs_NonGateSpawnZones, 
    Lighthouse_NonWaterTreatmentSpawnZones, 
    Lighthouse_SnipeSpawnZones, 
    Reserve_SpawnZones,
    Shoreline_SpawnZones,
    Shoreline_SnipeSpawnZones, 
    Streets_SpawnZones,
    Streets_SnipeSpawnZones,
    Woods_SpawnZones,
    Woods_SnipeSpawnZones 
} from "../Defaults/MapSpawnZones";
import { createExhaustableArray } from "../Utils/GlobalUtils";

@injectable()
export class ScavSpawnControl
{
    constructor(
        @inject("WinstonLogger") protected logger: ILogger,
        @inject("DatabaseService") protected databaseService: DatabaseService,
        @inject("RandomUtil") protected randomUtil: RandomUtil,
        @inject("PrimaryCloner") protected cloner: ICloner,
        @inject("WeightedRandomHelper") protected weightedRandomHelper: WeightedRandomHelper
    )
    {}

    public getCustomMapData(location: string): IWave[]
    {
        return this.getConfigValueForLocation(location)
    }

    private getConfigValueForLocation(location: string): IWave[]
    {
        const scavSpawnInfo: IWave[] = [];
        if (ModConfig.config.scavConfig.startingScavs.enable) scavSpawnInfo.push(...this.generateStartingScavs(location));
        if (ModConfig.config.scavConfig.startingScavs.startingMarksman) 
        {
            const marksmanSpawn = this.generateStartingScavs(location, "marksman");
            if (marksmanSpawn.length)
            {
                scavSpawnInfo.push(...marksmanSpawn);
            } 
        }
        return scavSpawnInfo;
    }

    public generateStartingScavs(location: string, botRole = "assault", lateStart = false): IWave[]
    {
        const scavWaveSpawnInfo: IWave[] = [];

        const waveLength = this.databaseService.getTables().locations[location].base.waves.length;

        const maxStartingSpawns: number = ModConfig.config.scavConfig.startingScavs.maxBotSpawns[location];
        const scavCap = lateStart ? maxStartingSpawns * 0.75 : maxStartingSpawns;
        const playerScavChance = lateStart ? 60 : 10;

        const maxBotsPerZone = location.includes("factory") || location.includes("sandbox") ? maxStartingSpawns : ModConfig.config.scavConfig.startingScavs.maxBotsPerZone;
        const availableSpawnZones = botRole == "assault" ? createExhaustableArray(this.getNonMarksmanSpawnZones(location), this.randomUtil, this.cloner) : createExhaustableArray(this.getMarksmanSpawnZones(location), this.randomUtil, this.cloner);
        let spawnsAdded = botRole == "assault" ? 0 : waveLength;

        while (spawnsAdded < scavCap)
        {
            if (spawnsAdded >= maxStartingSpawns) break;
            if (botRole != "assault" && !availableSpawnZones.hasValues()) break;

            const scavDefaultData = this.cloner.clone(this.getDefaultValues());
            const selectedSpawnZone = location.includes("factory") || location.includes("sandbox") || !availableSpawnZones.hasValues() ? "" : availableSpawnZones.getRandomValue();
            if (botRole == "marksman" && selectedSpawnZone == undefined) return scavWaveSpawnInfo;

            const remainingSpots = maxStartingSpawns - spawnsAdded;
            const groupSize = botRole == "assault" ? Math.min(remainingSpots - 1, this.randomUtil.getInt(1, maxBotsPerZone)) : 1;

            scavDefaultData.slots_min = groupSize > 1 ? 1 : 0;
            scavDefaultData.slots_max = groupSize > 1 ? groupSize : 1;
            scavDefaultData.time_min = -1;
            scavDefaultData.time_max = -1;
            scavDefaultData.number = spawnsAdded;
            scavDefaultData.WildSpawnType = botRole == "assault" ? WildSpawnType.ASSAULT : WildSpawnType.MARKSMAN;
            scavDefaultData.isPlayers = botRole == "assault" ? this.randomUtil.getChance100(playerScavChance) ? true : false : false;
            scavDefaultData.SpawnPoints = selectedSpawnZone;
            
            spawnsAdded++;
            scavWaveSpawnInfo.push(scavDefaultData);
            //this.logger.warning(`[Scav Waves] ${scavDefaultData.number} - Adding 1 spawn for ${botRole} to ${location} | Zone: ${selectedSpawnZone} Min: ${scavDefaultData.slots_min} | Max: ${scavDefaultData.slots_max}`);
        }

        return scavWaveSpawnInfo;
    }

    private getDefaultValues(): IWave
    {
        return scavData;
    }

    private getNonMarksmanSpawnZones(location: string): string[]
    {
        switch (location)
        {
            case "bigmap":
                return Customs_SpawnZones;
            case "factory4_day":
            case "factory4_night":
                return Factory_SpawnZones;
            case "interchange":
                return Interchange_SpawnZones;
            case "laboratory":
                return Labs_NonGateSpawnZones;
            case "lighthouse":
                return Lighthouse_NonWaterTreatmentSpawnZones;
            case "rezervbase":
                return Reserve_SpawnZones;
            case "sandbox":
            case "sandbox_high":
                return GroundZero_SpawnZones;
            case "shoreline":
                return Shoreline_SpawnZones;
            case "tarkovstreets":
                return Streets_SpawnZones;
            case "woods":
                return Woods_SpawnZones;
        }
    }

    private getMarksmanSpawnZones(location: string): string[]
    {
        switch (location)
        {
            case "bigmap":
                return Customs_SnipeSpawnZones;
            case "factory4_day":
            case "factory4_night":
                return undefined;
            case "interchange":
                return undefined;
            case "laboratory":
                return undefined;
            case "lighthouse":
                return Lighthouse_SnipeSpawnZones;
            case "rezervbase":
                return undefined;
            case "sandbox":
            case "sandbox_high":
                return undefined;
            case "shoreline":
                return Shoreline_SnipeSpawnZones;
            case "tarkovstreets":
                return Streets_SnipeSpawnZones;
            case "woods":
                return Woods_SnipeSpawnZones;
        }
    }

    public generateInitialScavsForRemainingRaidTime(location: string, botRole: string): IWave[]
    {
        const scavWaveSpawnInfo: IWave[] = [];

        const waveLength = this.databaseService.getTables().locations[location].base.waves.length;
        const scavDefaultData = this.cloner.clone(this.getDefaultValues());

        const difficulties = ModConfig.config.scavConfig.startingScavs.difficulty;
        const maxStartingSpawns: number = ModConfig.config.scavConfig.startingScavs.maxBotSpawns[location] * 0.75;
        const maxBotsPerZone = ModConfig.config.scavConfig.startingScavs.maxBotsPerZone;
        const marksmanCount = ModConfig.config.scavConfig.startingScavs.startingMarksman;

        const availableSpawnZones = createExhaustableArray(this.getNonMarksmanSpawnZones(location), this.randomUtil, this.cloner);
        let spawnsAdded = 0;

        while (spawnsAdded < maxStartingSpawns && availableSpawnZones.hasValues())
        {
            const selectedSpawnZone = availableSpawnZones.getRandomValue();
            const remainingSpots = maxStartingSpawns - spawnsAdded;
            const groupSize = Math.min(remainingSpots - 1, this.randomUtil.getInt(1, maxBotsPerZone));

            scavDefaultData.slots_min = groupSize > 1 ? 1 : 0;
            scavDefaultData.slots_max = groupSize > 1 ? groupSize : 0;
            scavDefaultData.time_min = -1;
            scavDefaultData.time_max = -1;
            scavDefaultData.BotPreset = this.weightedRandomHelper.getWeightedValue(difficulties);
            scavDefaultData.number = botRole == "assault" ? spawnsAdded : waveLength;
            scavDefaultData.isPlayers = botRole == "assault" ? this.randomUtil.getChance100(60) ? true : false : false;
            scavDefaultData.SpawnPoints = selectedSpawnZone;
            
            spawnsAdded++;
            scavWaveSpawnInfo.push(scavDefaultData);

            this.logger.warning(`[LATE Scavs] Adding 1 spawn for assault to ${location} | Min: ${scavDefaultData.slots_min} | Max: ${scavDefaultData.slots_max}`);
        }

        return scavWaveSpawnInfo;
    }
}
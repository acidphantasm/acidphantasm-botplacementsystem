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
import { CustomsSpawnZones, FactorySpawnZones, GroundZeroSpawnZones, InterchangeSpawnZones, LabsSpawnZones, LighthouseSpawnZones, ReserveSpawnZones, ShorelineSpawnZones, StreetsSpawnZones, WoodsSpawnZones } from "../Defaults/MapSpawnZones";

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

    public getCustomMapData(location: string, escapeTimeLimit: number): IWave[]
    {
        return this.getConfigValueForLocation(location, escapeTimeLimit)
    }

    private getConfigValueForLocation(location: string, escapeTimeLimit: number): IWave[]
    {
        let scavSpawnInfo: IWave[] = [];
        if (ModConfig.config.scavConfig.waves.enable)
        {
            scavSpawnInfo = scavSpawnInfo.concat(this.generateScavWaves(location, escapeTimeLimit));
        }
        return scavSpawnInfo;
    }

    private generateScavWaves(location: string, escapeTimeLimit: number): IWave[]
    {
        const scavWaveSpawnInfo: IWave[] = [];

        const locationConfig = this.databaseService.getTables().locations[location].base;
        const difficultyWeights = ModConfig.config.scavDifficulty;
        const waveMaxscavCount = ModConfig.config.scavConfig.waves.maxBotsPerWave;
        const waveGroupLimit = ModConfig.config.scavConfig.waves.maxGroupCount;
        const waveGroupSize = ModConfig.config.scavConfig.waves.maxGroupSize;
        const waveGroupChance = ModConfig.config.scavConfig.waves.groupChance;
        const firstWaveTimer = ModConfig.config.scavConfig.waves.delayBeforeFirstWave;
        const waveTimer = ModConfig.config.scavConfig.waves.secondsBetweenWaves;
        const endWavesAtRemainingTime = ModConfig.config.scavConfig.waves.stopWavesBeforeEndOfRaidLimit;
        const waveCount = Math.floor((((escapeTimeLimit * 60) - endWavesAtRemainingTime) - firstWaveTimer) / waveTimer);
        let currentWaveTime = firstWaveTimer;

        let wavesAddedCount = 0;
        //this.logger.warning(`[Scav Waves] Generating ${waveCount} waves for scavs`)
        for (let i = 1; i <= waveCount; i++)
        {
            let currentscavCount = 0;
            let groupCount = 0;
            while (currentscavCount < waveMaxscavCount)
            {
                if (groupCount >= waveGroupLimit) break;
                let groupSize = 0;
                const remainingSpots = waveMaxscavCount - currentscavCount;
                const isAGroup = remainingSpots > 1 ? this.randomUtil.getChance100(waveGroupChance) : false;
                if (isAGroup)
                {
                    groupSize = Math.min(remainingSpots - 1, this.randomUtil.getInt(1, waveGroupSize));
                }
                const scavDefaultData = this.cloner.clone(this.getDefaultValues());

                scavDefaultData.slots_min = groupSize > 1 ? groupSize : 1;
                scavDefaultData.slots_max = groupSize > 1 ? groupSize + 1 : 2;
                scavDefaultData.time_min = currentWaveTime - this.randomUtil.getInt(1, 60);
                scavDefaultData.time_max = currentWaveTime + this.randomUtil.getInt(1, 60);
                scavDefaultData.BotPreset = this.weightedRandomHelper.getWeightedValue(difficultyWeights);
                scavDefaultData.number = locationConfig.waves.length + wavesAddedCount;
                scavDefaultData.SpawnPoints = this.randomUtil.getStringArrayValue(this.getAvailableMapSpawns(location));
                currentscavCount += groupSize + 1;
                groupCount++;
                wavesAddedCount++;
                scavWaveSpawnInfo.push(scavDefaultData);

                //this.logger.warning(`[Scav Waves] Adding 1 spawn for assault to ${location} | GroupSize: ${groupSize + 1}`);
            }
            //this.logger.warning(`[Scav Waves] Wave: ${i} | Time: ${currentWaveTime} | Groups: ${groupCount} | TotalScavs: ${currentscavCount}/${waveMaxscavCount}`);
            currentWaveTime += waveTimer;
        }

        return scavWaveSpawnInfo;
    }

    private getDefaultValues(): IWave
    {
        return scavData;
    }

    private getAvailableMapSpawns(location: string): string[]
    {
        switch (location)
        {
            case "bigmap":
                return CustomsSpawnZones;
            case "factory4_day":
            case "factory4_night":
                return FactorySpawnZones;
            case "interchange":
                return InterchangeSpawnZones;
            case "laboratory":
                return LabsSpawnZones;
            case "lighthouse":
                return LighthouseSpawnZones;
            case "rezervbase":
                return ReserveSpawnZones;
            case "sandbox":
            case "sandbox_high":
                return GroundZeroSpawnZones;
            case "shoreline":
                return ShorelineSpawnZones;
            case "tarkovstreets":
                return StreetsSpawnZones;
            case "woods":
                return WoodsSpawnZones;
        }
    }

    public generateInitialScavsForRemainingRaidTime(location: string): IWave[]
    {
        const scavWaveSpawnInfo: IWave[] = [];

        const locationConfig = this.databaseService.getTables().locations[location].base;
        const difficultyWeights = ModConfig.config.scavDifficulty;
        const startingGroupLimit = 10;
        const startingGroupSize = 3;
        const startingGroupChance = 50;

        const generatedInitialScavCount = this.randomUtil.getInt(6, 10);

        let wavesAddedCount = 0;
        //this.logger.warning(`[Scav Waves] Generating ${waveCount} waves for scavs`)

        let currentscavCount = 0;
        let groupCount = 0;
        const scavDefaultData = this.cloner.clone(this.getDefaultValues());
        while (currentscavCount < generatedInitialScavCount)
        {
            if (groupCount >= startingGroupLimit) break;
            let groupSize = 0;
            const remainingSpots = generatedInitialScavCount - currentscavCount;
            const isAGroup = remainingSpots > 1 ? this.randomUtil.getChance100(startingGroupChance) : false;
            if (isAGroup) groupSize = Math.min(remainingSpots - 1, this.randomUtil.getInt(1, startingGroupSize));

            scavDefaultData.slots_min = groupSize > 1 ? groupSize : 1;
            scavDefaultData.slots_max = groupSize > 1 ? groupSize + 1 : 2;
            scavDefaultData.time_min = -1;
            scavDefaultData.time_max = -1;
            scavDefaultData.BotPreset = this.weightedRandomHelper.getWeightedValue(difficultyWeights);
            scavDefaultData.number = locationConfig.waves.length + wavesAddedCount;
            scavDefaultData.SpawnPoints = this.randomUtil.getStringArrayValue(this.getAvailableMapSpawns(location));
            currentscavCount += groupSize + 1;

            groupCount++;
            wavesAddedCount++;
            scavWaveSpawnInfo.push(scavDefaultData);
            //this.logger.warning(`[Scav Waves] Adding 1 spawn for assault to ${location} | GroupSize: ${groupSize + 1}`);
        }

        return scavWaveSpawnInfo;
    }
}
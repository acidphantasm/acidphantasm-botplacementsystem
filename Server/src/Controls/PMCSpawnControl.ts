import { injectable, inject } from "tsyringe";
import { IBossLocationSpawn } from "@spt/models/eft/common/ILocationBase";
import type { ILogger } from "@spt/models/spt/utils/ILogger";
import type { ICloner } from "@spt/utils/cloners/ICloner";
import { RandomUtil } from "@spt/utils/RandomUtil";
import { WeightedRandomHelper } from "@spt/helpers/WeightedRandomHelper";


// Default PMC Data
import { 
    pmcBEARData,
    pmcUSECData
} from "../Defaults/PMCs";

import { ModConfig } from "../Globals/ModConfig";
import { Labs_NonGateSpawnZones } from "../Defaults/MapSpawnZones";

@injectable()
export class PMCSpawnControl
{
    constructor(
        @inject("WinstonLogger") protected logger: ILogger,
        @inject("RandomUtil") protected randomUtil: RandomUtil,
        @inject("PrimaryCloner") protected cloner: ICloner,
        @inject("WeightedRandomHelper") protected weightedRandomHelper: WeightedRandomHelper
    )
    {}

    public getCustomMapData(location: string, escapeTimeLimit: number): IBossLocationSpawn[]
    {
        return this.getConfigValueForLocation(location, escapeTimeLimit)
    }

    private getConfigValueForLocation(location: string, escapeTimeLimit: number): IBossLocationSpawn[]
    {
        let pmcSpawnInfo: IBossLocationSpawn[] = [];
        if (ModConfig.config.pmcConfig.startingPMCs.enable)
        {
            pmcSpawnInfo = pmcSpawnInfo.concat(this.generateStartingPMCWaves(location));
        }
        if (ModConfig.config.pmcConfig.waves.enable)
        {
            pmcSpawnInfo = pmcSpawnInfo.concat(this.generatePMCWaves(location, escapeTimeLimit));
        }
        return pmcSpawnInfo;
    }

    private generateStartingPMCWaves(location: string): IBossLocationSpawn[]
    {
        const startingPMCWaveInfo: IBossLocationSpawn[] = [];
        const ignoreMaxBotCaps = ModConfig.config.pmcConfig.startingPMCs.ignoreMaxBotCaps;
        const minPMCCount = ModConfig.config.pmcConfig.startingPMCs.mapLimits[location].min;
        const maxPMCCount = ModConfig.config.pmcConfig.startingPMCs.mapLimits[location].max;
        const generatedPMCCount = this.randomUtil.getInt(minPMCCount, maxPMCCount);
        const groupChance = ModConfig.config.pmcConfig.startingPMCs.groupChance;
        const groupLimit = ModConfig.config.pmcConfig.startingPMCs.maxGroupCount;
        const groupMaxSize = ModConfig.config.pmcConfig.startingPMCs.maxGroupSize;
        const difficultyWeights = ModConfig.config.pmcDifficulty;

        let currentPMCCount = 0;
        let groupCount = 0;

        while (currentPMCCount < generatedPMCCount)
        {
            const canBeAGroup = groupCount >= groupLimit ? false : true;
            let groupSize = 0;
            const remainingSpots = generatedPMCCount - currentPMCCount;

            const isAGroup = remainingSpots > 1 ? this.randomUtil.getChance100(groupChance) : false;
            if (isAGroup && canBeAGroup) 
            {
                groupSize = Math.min(remainingSpots - 1, this.randomUtil.getInt(1, groupMaxSize));
                groupCount++
            }

            const pmcType = this.randomUtil.getChance100(50) ? "pmcUSEC" : "pmcBEAR";
            const bossDefaultData = this.cloner.clone(this.getDefaultValuesForBoss(pmcType));

            bossDefaultData[0].BossEscortAmount = groupSize.toString();
            bossDefaultData[0].BossDifficult = this.weightedRandomHelper.getWeightedValue(difficultyWeights);
            bossDefaultData[0].BossEscortDifficult = this.weightedRandomHelper.getWeightedValue(difficultyWeights);
            bossDefaultData[0].BossZone = "";
            bossDefaultData[0].IgnoreMaxBots = ignoreMaxBotCaps;
            currentPMCCount += groupSize + 1;
            startingPMCWaveInfo.push(bossDefaultData[0]);

            //this.logger.warning(`[Starting PMC] Adding 1 spawn for ${pmcType} to ${location} | GroupSize: ${groupSize + 1}`);
        }
        
        //this.logger.warning(`[Starting PMCs] Map: ${location} (Time Limit: ${escapeTimeLimit}m) | Limits: ${minPMCCount}-${maxPMCCount} | Groups: ${groupCount} | TotalPMCs: ${currentPMCCount}/${generatedPMCCount}`);
        return startingPMCWaveInfo;
    }

    private generatePMCWaves(location: string, escapeTimeLimit: number): IBossLocationSpawn[]
    {
        const pmcWaveSpawnInfo: IBossLocationSpawn[] = [];

        const ignoreMaxBotCaps = ModConfig.config.pmcConfig.waves.ignoreMaxBotCaps;
        const difficultyWeights = ModConfig.config.pmcDifficulty;
        const waveMaxPMCCount = location.includes("factory") ? Math.min(2, ModConfig.config.pmcConfig.waves.maxBotsPerWave - 2) : ModConfig.config.pmcConfig.waves.maxBotsPerWave;
        const waveGroupLimit = ModConfig.config.pmcConfig.waves.maxGroupCount;
        const waveGroupSize = ModConfig.config.pmcConfig.waves.maxGroupSize;
        const waveGroupChance = ModConfig.config.pmcConfig.waves.groupChance;
        const firstWaveTimer = ModConfig.config.pmcConfig.waves.delayBeforeFirstWave;
        const waveTimer = ModConfig.config.pmcConfig.waves.secondsBetweenWaves;
        const endWavesAtRemainingTime = ModConfig.config.pmcConfig.waves.stopWavesBeforeEndOfRaidLimit;
        const waveCount = Math.floor((((escapeTimeLimit * 60) - endWavesAtRemainingTime) - firstWaveTimer) / waveTimer);
        let currentWaveTime = firstWaveTimer;

        //this.logger.warning(`[PMC Waves] Generating ${waveCount} waves for PMCs`)
        for (let i = 1; i <= waveCount; i++)
        {
            let currentPMCCount = 0;
            let groupCount = 0;
            while (currentPMCCount < waveMaxPMCCount)
            {
                const canBeAGroup = groupCount >= waveGroupLimit ? false : true;
                let groupSize = 0;
                const remainingSpots = waveMaxPMCCount - currentPMCCount;
                const isAGroup = remainingSpots > 1 ? this.randomUtil.getChance100(waveGroupChance) : false;
                if (isAGroup && canBeAGroup) 
                {
                    groupSize = Math.min(remainingSpots - 1, this.randomUtil.getInt(1, waveGroupSize));
                    groupCount++
                }

                const pmcType = this.randomUtil.getChance100(50) ? "pmcUSEC" : "pmcBEAR";
                const bossDefaultData = this.cloner.clone(this.getDefaultValuesForBoss(pmcType));

                bossDefaultData[0].BossEscortAmount = groupSize.toString();
                bossDefaultData[0].Time = currentWaveTime;
                bossDefaultData[0].BossDifficult = this.weightedRandomHelper.getWeightedValue(difficultyWeights);
                bossDefaultData[0].BossEscortDifficult = this.weightedRandomHelper.getWeightedValue(difficultyWeights);
                bossDefaultData[0].BossZone = "";
                bossDefaultData[0].IgnoreMaxBots = ignoreMaxBotCaps;
                currentPMCCount += groupSize + 1;
                pmcWaveSpawnInfo.push(bossDefaultData[0]);

                //this.logger.warning(`[PMC Waves] Adding 1 spawn for ${pmcType} to ${location} | GroupSize: ${groupSize + 1}`);
            }
            //this.logger.warning(`[PMC Waves] Wave: ${i} | Time: ${currentWaveTime} | Groups: ${groupCount} | TotalPMCs: ${currentPMCCount}/${waveMaxPMCCount}`);
            currentWaveTime += waveTimer;
        }

        return pmcWaveSpawnInfo;
    }

    private getDefaultValuesForBoss(boss: string): IBossLocationSpawn[]
    {
        switch (boss)
        {
            case "pmcUSEC":
                return pmcUSECData;
            case "pmcBEAR":
                return pmcBEARData;
            default:
                this.logger.error(`[ABPS] PMC not found in config ${boss}`)
                return undefined;
        }
    }

    public generateScavRaidRemainingPMCs(location: string, remainingRaidTime: number): IBossLocationSpawn[]
    {
        const startingPMCWaveInfo: IBossLocationSpawn[] = [];
        const ignoreMaxBotCaps = ModConfig.config.pmcConfig.startingPMCs.ignoreMaxBotCaps;
        const minPMCCount = ModConfig.config.pmcConfig.startingPMCs.mapLimits[location].min;
        const maxPMCCount = ModConfig.config.pmcConfig.startingPMCs.mapLimits[location].max;
        let generatedPMCCount = this.randomUtil.getInt(minPMCCount, maxPMCCount);
        const groupChance = ModConfig.config.pmcConfig.startingPMCs.groupChance;
        const groupLimit = ModConfig.config.pmcConfig.startingPMCs.maxGroupCount;
        const groupMaxSize = ModConfig.config.pmcConfig.startingPMCs.maxGroupSize;
        const difficultyWeights = ModConfig.config.pmcDifficulty;

        let currentPMCCount = 0;
        let groupCount = 0;

        if (remainingRaidTime < 600) generatedPMCCount = this.randomUtil.getInt(1, 3);
        if (remainingRaidTime < 1200) generatedPMCCount = this.randomUtil.getInt(1, 6);
        if (remainingRaidTime < 1800) generatedPMCCount = this.randomUtil.getInt(4, 9);

        if (location.includes("factory") && generatedPMCCount > 5) generatedPMCCount -= 2;

        while (currentPMCCount < generatedPMCCount)
        {
            const canBeAGroup = groupCount >= groupLimit ? false : true;
            let groupSize = 0;
            const remainingSpots = generatedPMCCount - currentPMCCount;
            const isAGroup = remainingSpots > 1 ? this.randomUtil.getChance100(groupChance) : false;
            if (isAGroup && canBeAGroup) 
            {
                groupSize = Math.min(remainingSpots - 1, this.randomUtil.getInt(1, groupMaxSize));
                groupCount++
            }

            const pmcType = this.randomUtil.getChance100(50) ? "pmcUSEC" : "pmcBEAR";
            const bossDefaultData = this.cloner.clone(this.getDefaultValuesForBoss(pmcType));

            bossDefaultData[0].BossEscortAmount = groupSize.toString();
            bossDefaultData[0].BossDifficult = this.weightedRandomHelper.getWeightedValue(difficultyWeights);
            bossDefaultData[0].BossEscortDifficult = this.weightedRandomHelper.getWeightedValue(difficultyWeights);
            bossDefaultData[0].BossZone = "";
            bossDefaultData[0].IgnoreMaxBots = ignoreMaxBotCaps;
            currentPMCCount += groupSize + 1;
            startingPMCWaveInfo.push(bossDefaultData[0]);

            //this.logger.warning(`[Starting PMC] Adding 1 spawn for ${pmcType} to ${location} | GroupSize: ${groupSize + 1}`);
        }
        
        //this.logger.warning(`[Starting PMCs] Map: ${location} (Time Limit: ${escapeTimeLimit}m) | Limits: ${minPMCCount}-${maxPMCCount} | Groups: ${groupCount} | TotalPMCs: ${currentPMCCount}/${generatedPMCCount}`);
        return startingPMCWaveInfo;
    }
}
import { injectable, inject } from "tsyringe";
import { IBossLocationSpawn } from "@spt/models/eft/common/ILocationBase";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { ModConfig } from "../Globals/ModConfig";

// Default PMC Data
import { 
    pmcBEARData,
    pmcUSECData
} from "../Defaults/PMCs";

import { ICloner } from "@spt/utils/cloners/ICloner";
import { RandomUtil } from "@spt/utils/RandomUtil";
import { pmcMapLimitCounts } from "../Defaults/PMCMapLimits";

@injectable()
export class PMCSpawnControl
{
    constructor(
        @inject("WinstonLogger") protected logger: ILogger,
        @inject("RandomUtil") protected randomUtil: RandomUtil,
        @inject("PrimaryCloner") protected cloner: ICloner
    )
    {}

    public getCustomMapData(location: string, escapeTimeLimit: number): IBossLocationSpawn[]
    {
        return this.getConfigValueForLocation(location, escapeTimeLimit)
    }

    private getConfigValueForLocation(location: string, escapeTimeLimit: number): IBossLocationSpawn[]
    {
        let pmcSpawnInfo: IBossLocationSpawn[] = [];
        if (ModConfig.config.pmcConfig.startingPMCs.enabled)
        {
            pmcSpawnInfo = pmcSpawnInfo.concat(this.generateStartingPMCWaves(location, escapeTimeLimit));
        }
        if (ModConfig.config.pmcConfig.waves.enabled)
        {
            pmcSpawnInfo = pmcSpawnInfo.concat(this.generatePMCWaves(location, escapeTimeLimit));
        }
        return pmcSpawnInfo;
    }

    private generateStartingPMCWaves(location: string, escapeTimeLimit: number): IBossLocationSpawn[]
    {
        const startingPMCWaveInfo: IBossLocationSpawn[] = [];
        const minPMCCount = pmcMapLimitCounts[location].min;
        const maxPMCCount = pmcMapLimitCounts[location].max;
        const generatedPMCCount = this.randomUtil.getInt(minPMCCount, maxPMCCount);
        const groupChance = ModConfig.config.pmcConfig.startingPMCs.groupChance;
        const groupLimit = ModConfig.config.pmcConfig.startingPMCs.maxGroupCount;
        const groupMaxSize = ModConfig.config.pmcConfig.startingPMCs.maxGroupSize;

        let currentPMCCount = 0;
        let groupCount = 0;

        while (currentPMCCount < generatedPMCCount)
        {
            if (groupCount >= groupLimit) break;
            let groupSize = 0;
            const remainingSpots = generatedPMCCount - currentPMCCount;

            const isAGroup = remainingSpots > 1 ? this.randomUtil.getChance100(groupChance) : false;
            if (isAGroup)
            {
                groupSize = Math.min(remainingSpots - 1, this.randomUtil.getInt(1, groupMaxSize));
            }
            const pmcType = this.randomUtil.getChance100(50) ? "pmcUSEC" : "pmcBEAR";
            const bossDefaultData = this.cloner.clone(this.getDefaultValuesForBoss(pmcType));

            bossDefaultData[0].BossEscortAmount = groupSize.toString();
            currentPMCCount += groupSize + 1;
            groupCount++
            startingPMCWaveInfo.push(bossDefaultData[0]);

            //this.logger.warning(`[Starting PMC] Adding 1 spawn for ${pmcType} to ${location} | GroupSize: ${groupSize + 1}`);
        }
        
        //this.logger.warning(`[Starting PMCs] Map: ${location} (Time Limit: ${escapeTimeLimit}m) | Limits: ${minPMCCount}-${maxPMCCount} | Groups: ${groupCount} | TotalPMCs: ${currentPMCCount}/${generatedPMCCount}`);
        return startingPMCWaveInfo;
    }

    private generatePMCWaves(location: string, escapeTimeLimit: number): IBossLocationSpawn[]
    {
        const pmcWaveSpawnInfo: IBossLocationSpawn[] = [];

        const waveMaxPMCCount = location.includes("factory") ? Math.min(2, ModConfig.config.pmcConfig.waves.maxBotsPerWave - 2) : ModConfig.config.pmcConfig.waves.maxBotsPerWave;
        const waveGroupLimit = ModConfig.config.pmcConfig.waves.maxGroupCount;
        const waveGroupSize = ModConfig.config.pmcConfig.waves.maxGroupSize;
        const waveGroupChance = ModConfig.config.pmcConfig.waves.groupChance;
        const waveTimer = ModConfig.config.pmcConfig.waves.secondsBetweenWaves
        const endWavesAtRemainingTime = ModConfig.config.pmcConfig.waves.stopWavesBeforeEndOfRaidLimit;
        const waveCount = Math.floor(((escapeTimeLimit * 60) - endWavesAtRemainingTime) / waveTimer);
        let currentWaveTime = waveTimer;

        //this.logger.warning(`[PMC Waves] Generating ${waveCount} waves for PMCs`)
        for (let i = 1; i <= waveCount; i++)
        {
            let currentPMCCount = 0;
            let groupCount = 0;
            while (currentPMCCount < waveMaxPMCCount)
            {
                if (groupCount >= waveGroupLimit) break;
                let groupSize = 0;
                const remainingSpots = waveMaxPMCCount - currentPMCCount;
                const isAGroup = remainingSpots > 1 ? this.randomUtil.getChance100(waveGroupChance) : false;
                if (isAGroup)
                {
                    groupSize = Math.min(remainingSpots - 1, this.randomUtil.getInt(1, waveGroupSize));
                }
                const pmcType = this.randomUtil.getChance100(50) ? "pmcUSEC" : "pmcBEAR";
                const bossDefaultData = this.cloner.clone(this.getDefaultValuesForBoss(pmcType));

                bossDefaultData[0].BossEscortAmount = groupSize.toString();
                bossDefaultData[0].Time = currentWaveTime;
                currentPMCCount += groupSize + 1;
                groupCount++
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
}
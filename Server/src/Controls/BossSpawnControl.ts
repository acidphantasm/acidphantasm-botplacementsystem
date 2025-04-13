import { injectable, inject } from "tsyringe";
import { IBossLocationSpawn } from "@spt/models/eft/common/ILocationBase";
import type { ILogger } from "@spt/models/spt/utils/ILogger";
import type { ICloner } from "@spt/utils/cloners/ICloner";
import { WeightedRandomHelper } from "@spt/helpers/WeightedRandomHelper";
import { RandomUtil } from "@spt/utils/RandomUtil";
import { ModConfig } from "../Globals/ModConfig";

// Default Boss Data
import { 
    arenaFighterEventData, 
    bossBoarData, 
    bossBullyData, 
    bossGluharData, 
    bossKillaData, 
    bossKnightData, 
    bossKojaniyData, 
    bossKolontayData, 
    bossPartisanData,  
    bossSanitarData, 
    bossTagillaData, 
    bossZryachiyData, 
    exUsecData, 
    gifterData,
    pmcBotData,
    pmcBotReserveData, 
    pmcBotLaboratoryData, 
    sectantPriestData 
} from "../Defaults/Bosses"

@injectable()
export class BossSpawnControl
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
        const bossesForMap: IBossLocationSpawn[] = [];
        for (const boss in ModConfig.config.bossConfig)
        {
            const bossDefaultData = this.cloner.clone(this.getDefaultValuesForBoss(boss, location));
            const bossConfigData = ModConfig.config.bossConfig[boss];
            const difficultyWeights = ModConfig.config.bossDifficulty;

            if (!bossConfigData.enable) continue;

            if (boss == "exUsec" && !bossConfigData.disableVanillaSpawns && location == "lighthouse" || boss == "pmcBot" && !bossConfigData.disableVanillaSpawns && (location == "laboratory" || location == "rezervbase"))
            {
                for (const bossSpawn in bossDefaultData)
                {
                    // Create the vanilla spawns
                    //bossDefaultData[bossSpawn].BossChance = bossConfigData.spawnChance[location];
                    bossDefaultData[0].BossDifficult = this.weightedRandomHelper.getWeightedValue(difficultyWeights);
                    bossesForMap.push(bossDefaultData[bossSpawn]);
                }
                if (!bossConfigData.addExtraSpawns) continue;
            }

            if (!bossConfigData.spawnChance[location]) continue;

            if (location.includes("factory")) bossConfigData.bossZone[location] = "BotZone"
            if ((boss == "pmcBot") && bossConfigData.addExtraSpawns) 
            {
                bossesForMap.push(...this.generateBossWaves(location, escapeTimeLimit));
                continue;
            }
            
            bossDefaultData[0].BossChance = bossConfigData.spawnChance[location];
            bossDefaultData[0].BossZone = bossConfigData.bossZone[location];
            bossDefaultData[0].BossDifficult = this.weightedRandomHelper.getWeightedValue(difficultyWeights);
            bossDefaultData[0].BossEscortDifficult = this.weightedRandomHelper.getWeightedValue(difficultyWeights);
            bossDefaultData[0].Time = bossConfigData.time;
            bossesForMap.push(bossDefaultData[0]);
        }

        return bossesForMap;
    }

    private generateBossWaves(location: string, escapeTimeLimit: number): IBossLocationSpawn[]
    {
        const pmcWaveSpawnInfo: IBossLocationSpawn[] = [];

        const difficultyWeights = ModConfig.config.bossDifficulty;
        const waveMaxPMCCount = location != "laboratory" ? 4 : 10;
        const waveGroupLimit = 4;
        const waveGroupSize = 2;
        const waveGroupChance = 100;
        const waveTimer = 450;
        const endWavesAtRemainingTime = 300;
        const waveCount = Math.floor((((escapeTimeLimit * 60) - endWavesAtRemainingTime)) / waveTimer);
        let currentWaveTime = waveTimer;
        const bossConfigData = ModConfig.config.bossConfig["pmcBot"];

        //this.logger.warning(`[Boss Waves] Generating ${waveCount} waves for Raiders`)
        for (let i = 1; i <= waveCount; i++)
        {
            if (i == 1) currentWaveTime = -1;

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
                const bossDefaultData = this.cloner.clone(this.getDefaultValuesForBoss("pmcBot", ""));

                bossDefaultData[0].BossChance = bossConfigData.spawnChance[location];
                bossDefaultData[0].BossZone = bossConfigData.bossZone[location];
                bossDefaultData[0].BossEscortAmount = groupSize.toString();
                bossDefaultData[0].BossDifficult = this.weightedRandomHelper.getWeightedValue(difficultyWeights);
                bossDefaultData[0].BossEscortDifficult = this.weightedRandomHelper.getWeightedValue(difficultyWeights);
                bossDefaultData[0].IgnoreMaxBots = false;
                bossDefaultData[0].Time = currentWaveTime;
                currentPMCCount += groupSize + 1;
                groupCount++
                pmcWaveSpawnInfo.push(bossDefaultData[0]);

                //this.logger.warning(`[Boss Waves] Adding 1 spawn for Raiders to ${location} | GroupSize: ${groupSize + 1}`);
            }
            //this.logger.warning(`[Boss Waves] Wave: ${i} | Time: ${currentWaveTime} | Groups: ${groupCount} | TotalRaiderss: ${currentPMCCount}/${waveMaxPMCCount}`);
            currentWaveTime += waveTimer;
        }

        return pmcWaveSpawnInfo;
    }

    private getDefaultValuesForBoss(boss: string, location: string): IBossLocationSpawn[]
    {
        switch (boss)
        {
            case "bossKnight":
                return bossKnightData;
            case "bossBully":
                return bossBullyData;
            case "bossTagilla":
                return bossTagillaData;
            case "bossKilla":
                return bossKillaData;
            case "bossZryachiy":
                return bossZryachiyData;
            case "bossGluhar":
                return bossGluharData;
            case "bossSanitar":
                return bossSanitarData;
            case "bossKolontay":
                return bossKolontayData;
            case "bossBoar":
                return bossBoarData;
            case "bossKojaniy":
                return bossKojaniyData;
            case "bossPartisan":
                return bossPartisanData;
            case "sectantPriest":
                return sectantPriestData;
            case "arenaFighterEvent":
                return arenaFighterEventData;
            case "pmcBot": // Requires Triggers + Has Multiple Zones
                if (location == "rezervbase") return pmcBotReserveData;
                if (location == "laboratory") return pmcBotLaboratoryData;
                else return pmcBotData;
            case "exUsec": // Has Multiple Zones
                return exUsecData;
            case "gifter":
                return gifterData;
            default:
                this.logger.error(`[ABPS] Boss not found in config ${boss}`)
                return undefined;
        }
    }
}
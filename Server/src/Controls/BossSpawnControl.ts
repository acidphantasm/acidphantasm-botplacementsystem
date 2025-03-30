import { injectable, inject } from "tsyringe";
import { IBossLocationSpawn } from "@spt/models/eft/common/ILocationBase";
import { ILogger } from "@spt/models/spt/utils/ILogger";
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
    bossLegionData, 
    bossPartisanData, 
    bossPunisherData, 
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
import { ICloner } from "@spt/utils/cloners/ICloner";

@injectable()
export class BossSpawnControl
{
    constructor(
        @inject("WinstonLogger") protected logger: ILogger,
        @inject("PrimaryCloner") protected cloner: ICloner
    )
    {}

    public getCustomMapData(location: string): IBossLocationSpawn[]
    {
        return this.getConfigValueForLocation(location)
    }

    private getConfigValueForLocation(location: string): IBossLocationSpawn[]
    {
        const bossesForMap: IBossLocationSpawn[] = [];
        for (const boss in ModConfig.config.bossConfig)
        {
            const bossDefaultData = this.cloner.clone(this.getDefaultValuesForBoss(boss, location));
            const bossConfigData = ModConfig.config.bossConfig[boss];

            if (!bossConfigData.enable) continue;

            if (boss == "exUsec" && !bossConfigData.disableVanillaSpawns && location == "lighthouse" || boss == "pmcBot" && !bossConfigData.disableVanillaSpawns && (location == "laboratory" || location == "rezervbase"))
            {
                for (const bossSpawn in bossDefaultData)
                {
                    // These require specific spawns & triggers
                    bossDefaultData[bossSpawn].BossChance = bossConfigData.spawnChance[location];
                    bossesForMap.push(bossDefaultData[bossSpawn]);
                }
                if (!bossConfigData.addExtraSpawns) continue;
            }

            if (!bossConfigData.spawnChance[location]) continue;

            if (location.includes("factory")) bossConfigData.bossZone[location] = "BotZone"
            
            bossDefaultData[0].BossChance = bossConfigData.spawnChance[location];
            bossDefaultData[0].BossZone = bossConfigData.bossZone[location];
            bossDefaultData[0].Time = bossConfigData.time;
            bossesForMap.push(bossDefaultData[0]);
        }

        return bossesForMap;
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
            case "bossPunisher":
                return bossPunisherData;
            case "bossLegion":
                return bossLegionData;
            default:
                this.logger.error(`[ABPS] Boss not found in config ${boss}`)
                return undefined;
        }
    }
}
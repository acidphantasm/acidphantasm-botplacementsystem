import { inject, injectable } from "tsyringe";
import { FileSystemSync } from "@spt/utils/FileSystemSync";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import path from "node:path";
import { MinMax } from "@spt/models/common/MinMax";

@injectable()
export class ModConfig
{
    public static config: Config;
    private lol: string;

    constructor(
        @inject("PrimaryLogger") protected logger: ILogger,
        @inject("FileSystemSync") protected fileSystemSync: FileSystemSync
    )
    {
        ModConfig.config = this.fileSystemSync.readJson(path.resolve(__dirname, "../../config/config.json"));
    }
}
export interface Config
{
    progressiveChance: MinMax
    pmcDifficulty: Record<DifficultyConfig, number>,
    pmcConfig: PMCConfig,
    bossDifficulty: Record<DifficultyConfig, number>,
    bossConfig: BossConfig,
    configAppSettings: ConfigAppSettings,
}
export interface PMCConfig
{
    startingPMCs: PMCStartingConfig,
    waves: PMCWaveConfig,
}
export type DifficultyConfig = "easy" | "normal" | "hard" | "impossible";
export interface PMCStartingConfig
{
    enable: boolean,
    groupChance: number,
    maxGroupSize: number,
    maxGroupCount: number
}
export interface PMCWaveConfig
{
    enable: boolean,
    groupChance: number,
    maxGroupSize: number,
    maxGroupCount: number,
    maxBotsPerWave: number,
    secondsBetweenWaves: number,
    stopWavesBeforeEndOfRaidLimit: number
}
export interface BossConfig
{
    bossKnight: BossLocationInfo,
    bossBully: BossLocationInfo,
    bossTagilla: BossLocationInfo,
    bossKilla: BossLocationInfo,
    bossZryachiy: BossLocationInfo,
    bossGluhar: BossLocationInfo,
    bossSanitar: BossLocationInfo,
    bossKolontay: BossLocationInfo,
    bossBoar: BossLocationInfo,
    bossKojaniy: BossLocationInfo,
    bossPartisan: BossLocationInfo,
    sectantPriest: BossLocationInfo,
    arenaFighterEvent: BossLocationInfo,
    pmcBot: SpecialLocationInfo,
    exUsec: SpecialLocationInfo,
    gifter: BossLocationInfo,
    bossPunisher: BossLocationInfo,
    bossLegion: BossLocationInfo,
}
export interface BossLocationInfo
{
    enable: boolean,
    useProgressiveChances: boolean,
    time: number,
    spawnChance: ValidLocations,
    bossZone: ValidLocations;
}
export interface SpecialLocationInfo
{
    enable: boolean,
    addExtraSpawns: boolean,
    disableVanillaSpawns: boolean,
    useProgressiveChances: boolean,
    time: number,
    spawnChance: ValidLocations,
    bossZone: ValidLocations;
}
export interface ValidLocations
{
    bigmap: number | string,
    factory4_day: number | string,
    factory4_night: number | string,
    interchange: number | string,
    laboratory: number | string,
    lighthouse: number | string,
    rezervbase: number | string,
    sandbox: number | string,
    sandbox_high: number | string,
    shoreline: number | string,
    tarkovstreets: number | string,
    woods: number | string,
}

export interface ConfigAppSettings
{
    showUndo: boolean,
    showDefault: boolean,
    disableAnimations: boolean
}
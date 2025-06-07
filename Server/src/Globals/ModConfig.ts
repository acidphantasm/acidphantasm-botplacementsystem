import { inject, injectable } from "tsyringe";
import type  { FileSystemSync } from "@spt/utils/FileSystemSync";
import type { ILogger } from "@spt/models/spt/utils/ILogger";
import path from "node:path";
import { MinMax } from "@spt/models/common/MinMax";

@injectable()
export class ModConfig
{
    public static config: Config;
    private lol: string;

    constructor(
        @inject("PrimaryLogger") private logger: ILogger,
        @inject("FileSystemSync") private fileSystemSync: FileSystemSync
    )
    {
        ModConfig.config = this.fileSystemSync.readJson(path.resolve(__dirname, "../../config/config.json"));
    }
}
export interface Config
{
    pmcDifficulty: Record<DifficultyConfig, number>,
    pmcConfig: PMCConfig,
    scavConfig: ScavConfig,
    bossDifficulty: Record<DifficultyConfig, number>,
    bossConfig: BossConfig,
    configAppSettings: ConfigAppSettings,
}
export interface PMCConfig
{
    startingPMCs: PMCStartingConfig,
    waves: WaveConfig,
}
export interface ScavConfig
{
    startingScavs: ScavStartingConfig,
    waves: ScavWaveConfig,
}
export interface ScavStartingConfig
{
    enable: boolean,
    maxBotSpawns: ValidLocations,
    startingMarksman: boolean,
}
export interface ScavWaveConfig
{
    enable: boolean,
    enableCustomFactory: boolean,
    startSpawns: number,
    stopSpawns: number,
    activeTimeMin: number,
    activeTimeMax: number,
    quietTimeMin: number,
    quietTimeMax: number,
    checkToSpawnTimer: number,
    pendingBotsToTrigger: number,
}
export type DifficultyConfig = "easy" | "normal" | "hard" | "impossible";
export interface PMCStartingConfig
{
    enable: boolean,
    ignoreMaxBotCaps: boolean,
    groupChance: number,
    maxGroupSize: number,
    maxGroupCount: number,
    mapLimits: MinMaxLocations
}
export interface WaveConfig
{
    enable: boolean,
    ignoreMaxBotCaps: boolean,
    groupChance: number,
    maxGroupSize: number,
    maxGroupCount: number,
    maxBotsPerWave: number,
    delayBeforeFirstWave: number,
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
}
export interface BossLocationInfo
{
    enable: boolean,
    time: number,
    spawnChance: ValidLocations,
    bossZone: ValidLocations;
}
export interface SpecialLocationInfo
{
    enable: boolean,
    addExtraSpawns: boolean,
    disableVanillaSpawns: boolean,
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
export interface MinMaxLocations
{
    bigmap: MinMax,
    factory4_day: MinMax,
    factory4_night: MinMax,
    interchange: MinMax,
    laboratory: MinMax,
    lighthouse: MinMax,
    rezervbase: MinMax,
    sandbox: MinMax,
    sandbox_high: MinMax,
    shoreline: MinMax,
    tarkovstreets: MinMax,
    woods: MinMax,
}

export interface ConfigAppSettings
{
    showUndo: boolean,
    showDefault: boolean,
    disableAnimations: boolean
}
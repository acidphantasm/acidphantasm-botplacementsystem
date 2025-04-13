using System;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;
using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Runtime.Serialization;
using System.Windows.Input;
using System.Windows.Media.TextFormatting;
using System.Windows.Shapes;
using ABPSConfig.Pages.General;
using Microsoft.AspNetCore.Authorization;
using Newtonsoft.Json;
using Path = System.IO.Path;

namespace ABPSConfig.Core
{
    public class ABPSServerConfig
    {
        public required Difficulty pmcDifficulty { get; set; }
        public required PMCConfig pmcConfig { get; set; }
        public required ScavConfig scavConfig { get; set; }
        public required Difficulty bossDifficulty { get; set; }
        public required BossConfig bossConfig { get; set; }
        public required ConfigAppSettings configAppSettings { get; set; }
    }
    public class Difficulty
    {
        public int easy { get; set; }
        public int normal { get; set; }
        public int hard { get; set; }
        public int impossible { get; set; }
    }
    public class PMCConfig
    {
        public required StartingPMCConfig startingPMCs { get; set; }
        public required PMCWaveConfig waves { get; set; }
    }
    public class StartingPMCConfig
    {
        public bool enable { get; set; }
        public int groupChance { get; set; }
        public int maxGroupSize { get; set; }
        public int maxGroupCount { get; set; }
        public required ValidLocationsMinMax mapLimits { get; set; }
    }
    public class PMCWaveConfig
    {
        public bool enable { get; set; }
        public int groupChance { get; set; }
        public int maxGroupSize { get; set; }
        public int maxGroupCount { get; set; }
        public int maxBotsPerWave { get; set; }
        public int delayBeforeFirstWave { get; set; }
        public int secondsBetweenWaves { get; set; }
        public int stopWavesBeforeEndOfRaidLimit { get; set; }
    }
    public class ScavConfig
    {
        public required StartingScavConfig startingScavs { get; set; }
        public required ScavWaveConfig waves { get; set; }
    }
    public class StartingScavConfig
    {
        public bool enable { get; set; }
        public required ValidLocationsNumber maxBotSpawns { get; set; }
        public int maxBotsPerZone { get; set; }
        public bool startingMarksman { get; set; }
    }
    public class ScavWaveConfig
    {
        public bool enable { get; set; }
        public int startSpawns { get; set; }
        public int stopSpawns { get; set; }
        public int activeTimeMin { get; set; }
        public int activeTimeMax { get; set; }
        public int quietTimeMin { get; set; }
        public int quietTimeMax { get; set; }
        public int checkToSpawnTimer { get; set; }
        public int pendingBotsToTrigger { get; set; }
    }
    public class MinMax
    {
        public int min { get; set; }
        public int max { get; set; }
    }
    public class ConfigAppSettings
    {
        public bool showUndo { get; set; }
        public bool showDefault { get; set; }
        public bool disableAnimations { get; set; }
    }
    public class BossConfig
    {
        public required BossLocationInfo bossKnight { get; set; }
        public required BossLocationInfo bossBully { get; set; }
        public required BossLocationInfo bossTagilla { get; set; }
        public required BossLocationInfo bossKilla { get; set; }
        public required BossLocationInfo bossZryachiy { get; set; }
        public required BossLocationInfo bossGluhar { get; set; }
        public required BossLocationInfo bossSanitar { get; set; }
        public required BossLocationInfo bossKolontay { get; set; }
        public required BossLocationInfo bossBoar { get; set; }
        public required BossLocationInfo bossKojaniy { get; set; }
        public required BossLocationInfo bossPartisan { get; set; }
        public required BossLocationInfo sectantPriest { get; set; }
        public required BossLocationInfo arenaFighterEvent { get; set; }
        public required SpecialLocationInfo pmcBot { get; set; }
        public required SpecialLocationInfo exUsec { get; set; }
        public required BossLocationInfo gifter { get; set; }
        public required BossLocationInfo bossPunisher { get; set; }
        public required BossLocationInfo bossLegion { get; set; }
    }
    public class BossLocationInfo
    {
        public bool enable { get; set; }
        public int time { get; set; }
        public required ValidLocationsNumber spawnChance { get; set; }
        public required ValidLocationsString bossZone { get; set; }
    }
    public class SpecialLocationInfo
    {
        public bool enable { get; set; }
        public bool addExtraSpawns { get; set; }
        public bool disableVanillaSpawns { get; set; }
        public int time { get; set; }
        public required ValidLocationsNumber spawnChance { get; set; }
        public required ValidLocationsString bossZone { get; set; }
    }
    public class ValidLocationsNumber
    {
        public int bigmap { get; set; }
        public int factory4_day { get; set; }
        public int factory4_night { get; set; }
        public int interchange { get; set; }
        public int laboratory { get; set; }
        public int lighthouse { get; set; }
        public int rezervbase { get; set; }
        public int sandbox { get; set; }
        public int sandbox_high { get; set; }
        public int shoreline { get; set; }
        public int tarkovstreets { get; set; }
        public int woods { get; set; }
    }
    public class ValidLocationsMinMax
    {
        public required MinMax bigmap { get; set; }
        public required MinMax factory4_day { get; set; }
        public required MinMax factory4_night { get; set; }
        public required MinMax interchange { get; set; }
        public required MinMax laboratory { get; set; }
        public required MinMax lighthouse { get; set; }
        public required MinMax rezervbase { get; set; }
        public required MinMax sandbox { get; set; }
        public required MinMax sandbox_high { get; set; }
        public required MinMax shoreline { get; set; }
        public required MinMax tarkovstreets { get; set; }
        public required MinMax woods { get; set; }
    }
    public class ValidLocationsString
    {
        public required string bigmap { get; set; }
        public required string factory4_day { get; set; }
        public required string factory4_night { get; set; }
        public required string interchange { get; set; }
        public required string laboratory { get; set; }
        public required string lighthouse { get; set; }
        public required string rezervbase { get; set; }
        public required string sandbox { get; set; }
        public required string sandbox_high { get; set; }
        public required string shoreline { get; set; }
        public required string tarkovstreets { get; set; }
        public required string woods { get; set; }
    }

    public class DataLoader
    {
        private static readonly string directory = System.AppContext.BaseDirectory;

        public static ABPSServerConfig Data { get; set; } = default!;
        public static ABPSServerConfig OriginalConfig { get; set; } = default!;

        public static bool initialLoad = false;
        public static bool LoadJson()
        {
            if (directory != null)
            {
                var configPath = Path.Combine(directory, "./config/config.json");
                var blacklistPath = Path.Combine(directory, "./config/blacklists.json");

                try
                {
                    Data = JsonConvert.DeserializeObject<ABPSServerConfig>(File.ReadAllText(configPath)) ?? default!;
                    // Reserialize Data into temporary object to reset OriginalConfig to current loaded config
                    string serializedData = JsonConvert.SerializeObject(Data);
                    OriginalConfig = JsonConvert.DeserializeObject<ABPSServerConfig>(serializedData)!;

                    return true;
                }
                catch
                {
                    return false;
                }
            }
            return false;
        }
        public static bool SaveJson()
        {

            if (directory != null)
            {
                var configPath = Path.Combine(directory, "./config/config.json");
                var blacklistPath = Path.Combine(directory, "./config/blacklists.json");

                try
                {
                    File.WriteAllText(configPath, JsonConvert.SerializeObject(Data, Formatting.Indented));
                    // Reserialize Data into temporary object to reset OriginalConfig to current loaded config
                    string serializedData = JsonConvert.SerializeObject(Data);
                    OriginalConfig = JsonConvert.DeserializeObject<ABPSServerConfig>(serializedData)!;


                    return true;
                }
                catch
                {
                    return false;
                }
            }
            return false;
        }
    }
}

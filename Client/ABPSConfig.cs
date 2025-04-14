using acidphantasm_botplacementsystem.Patches;
using acidphantasm_botplacementsystem.Spawning;
using acidphantasm_botplacementsystem.Utils;
using BepInEx.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace acidphantasm_botplacementsystem
{
    internal static class ABPSConfig
    {
        private static int loadOrder = 100;

        private const string GeneralConfig = "1. General Settings";
        public static ConfigEntry<bool> progressiveChances;
        public static ConfigEntry<int> chanceStep;
        public static ConfigEntry<int> minimumChance;
        public static ConfigEntry<int> maximumChance;

        private const string PMCConfig = "2. PMC Settings";
        public static ConfigEntry<float> customs_PMCSpawnDistanceCheck;
        public static ConfigEntry<float> factory_PMCSpawnDistanceCheck;
        public static ConfigEntry<float> interchange_PMCSpawnDistanceCheck;
        public static ConfigEntry<float> labs_PMCSpawnDistanceCheck;
        public static ConfigEntry<float> lighthouse_PMCSpawnDistanceCheck;
        public static ConfigEntry<float> reserve_PMCSpawnDistanceCheck;
        public static ConfigEntry<float> groundZero_PMCSpawnDistanceCheck;
        public static ConfigEntry<float> shoreline_PMCSpawnDistanceCheck;
        public static ConfigEntry<float> streets_PMCSpawnDistanceCheck;
        public static ConfigEntry<float> woods_PMCSpawnDistanceCheck;

        private const string ScavConfig = "3. Scav Settings";
        public static ConfigEntry<int> _softCap;
        public static ConfigEntry<int> _pScavChance;
        public static ConfigEntry<float> customs_ScavSpawnDistanceCheck;
        public static ConfigEntry<float> factory_ScavSpawnDistanceCheck;
        public static ConfigEntry<float> interchange_ScavSpawnDistanceCheck;
        public static ConfigEntry<float> labs_ScavSpawnDistanceCheck;
        public static ConfigEntry<float> lighthouse_ScavSpawnDistanceCheck;
        public static ConfigEntry<float> reserve_ScavSpawnDistanceCheck;
        public static ConfigEntry<float> groundZero_ScavSpawnDistanceCheck;
        public static ConfigEntry<float> shoreline_ScavSpawnDistanceCheck;
        public static ConfigEntry<float> streets_ScavSpawnDistanceCheck;
        public static ConfigEntry<float> woods_ScavSpawnDistanceCheck;

        public static void InitABPSConfig(ConfigFile config)
        {
            // General Settings
            progressiveChances = config.Bind(
                GeneralConfig,
                "Progressive Boss Chances",
                false,
                new ConfigDescription("Whether or not bosses will have progressive chances",
                null,
                new ConfigurationManagerAttributes { Order = loadOrder-- }));
            BossSpawnTracking.progressiveChances = progressiveChances.Value;
            progressiveChances.SettingChanged += ABPS_SettingChanged;

            chanceStep = config.Bind(
                GeneralConfig,
                "Progressive - Step Increase",
                5,
                new ConfigDescription("If a boss fails to spawn, how much to increase their spawn chance by.",
                new AcceptableValueRange<int>(1, 15),
                new ConfigurationManagerAttributes { Order = loadOrder-- }));
            BossSpawnTracking.chanceStep = chanceStep.Value;
            chanceStep.SettingChanged += ABPS_SettingChanged;

            minimumChance = config.Bind(
                GeneralConfig,
                "Progressive - Minimum Chance",
                5,
                new ConfigDescription("The value that a bosses chance will reset to if it spawns.",
                new AcceptableValueRange<int>(1, 25),
                new ConfigurationManagerAttributes { Order = loadOrder-- }));
            BossSpawnTracking.minimumChance = minimumChance.Value;
            minimumChance.SettingChanged += ABPS_SettingChanged;

            maximumChance = config.Bind(
                GeneralConfig,
                "Progressive - Maximum Chance",
                100,
                new ConfigDescription("The maximum value that a boss can have to spawn.",
                new AcceptableValueRange<int>(26, 100),
                new ConfigurationManagerAttributes { Order = loadOrder-- }));
            BossSpawnTracking.maximumChance = maximumChance.Value;
            maximumChance.SettingChanged += ABPS_SettingChanged;

            // PMC Settings
            customs_PMCSpawnDistanceCheck = config.Bind(
                PMCConfig,
                "Distance Limit - Customs", 
                100f, 
                new ConfigDescription("How far all PMCs must be from a spawn point for it to be enabled for other PMC spawns.\n Setting this too high will cause PMCs to fail to spawn.", 
                new AcceptableValueRange<float>(10f, 175f), 
                new ConfigurationManagerAttributes { Order = loadOrder-- }));
            PMCDistancePatch.customs_PMCSpawnDistanceCheck = customs_PMCSpawnDistanceCheck.Value;
            customs_PMCSpawnDistanceCheck.SettingChanged += ABPS_SettingChanged;

            factory_PMCSpawnDistanceCheck = config.Bind(
                PMCConfig,
                "Distance Limit - Factory", 
                30f, new ConfigDescription("How far all PMCs must be from a spawn point for it to be enabled for other PMC spawns.\n Setting this too high will cause PMCs to fail to spawn.", 
                new AcceptableValueRange<float>(10f, 175f), 
                new ConfigurationManagerAttributes { Order = loadOrder-- }));
            PMCDistancePatch.factory_PMCSpawnDistanceCheck = factory_PMCSpawnDistanceCheck.Value;
            factory_PMCSpawnDistanceCheck.SettingChanged += ABPS_SettingChanged;

            interchange_PMCSpawnDistanceCheck = config.Bind(
                PMCConfig,
                "Distance Limit - Interchange",
                125f, new ConfigDescription("How far all PMCs must be from a spawn point for it to be enabled for other PMC spawns.\n Setting this too high will cause PMCs to fail to spawn.", 
                new AcceptableValueRange<float>(10f, 175f), 
                new ConfigurationManagerAttributes { Order = loadOrder-- }));
            PMCDistancePatch.interchange_PMCSpawnDistanceCheck = interchange_PMCSpawnDistanceCheck.Value;
            interchange_PMCSpawnDistanceCheck.SettingChanged += ABPS_SettingChanged;

            labs_PMCSpawnDistanceCheck = config.Bind(
                PMCConfig,
                "Distance Limit - Labs", 
                40f, new ConfigDescription("How far all PMCs must be from a spawn point for it to be enabled for other PMC spawns.\n Setting this too high will cause PMCs to fail to spawn.", 
                new AcceptableValueRange<float>(10f, 175f), 
                new ConfigurationManagerAttributes { Order = loadOrder-- }));
            PMCDistancePatch.labs_PMCSpawnDistanceCheck = labs_PMCSpawnDistanceCheck.Value;
            labs_PMCSpawnDistanceCheck.SettingChanged += ABPS_SettingChanged;

            lighthouse_PMCSpawnDistanceCheck = config.Bind(
                PMCConfig,
                "Distance Limit - Lighthouse",
                125f, new ConfigDescription("How far all PMCs must be from a spawn point for it to be enabled for other PMC spawns.\n Setting this too high will cause PMCs to fail to spawn.", 
                new AcceptableValueRange<float>(10f, 175f), 
                new ConfigurationManagerAttributes { Order = loadOrder-- }));
            PMCDistancePatch.lighthouse_PMCSpawnDistanceCheck = lighthouse_PMCSpawnDistanceCheck.Value;
            lighthouse_PMCSpawnDistanceCheck.SettingChanged += ABPS_SettingChanged;

            reserve_PMCSpawnDistanceCheck = config.Bind(
                PMCConfig,
                "Distance Limit - Reserve",
                90f, new ConfigDescription("How far all PMCs must be from a spawn point for it to be enabled for other PMC spawns.\n Setting this too high will cause PMCs to fail to spawn.", 
                new AcceptableValueRange<float>(10f, 175f), 
                new ConfigurationManagerAttributes { Order = loadOrder-- }));
            PMCDistancePatch.reserve_PMCSpawnDistanceCheck = reserve_PMCSpawnDistanceCheck.Value;
            reserve_PMCSpawnDistanceCheck.SettingChanged += ABPS_SettingChanged;
            
            groundZero_PMCSpawnDistanceCheck = config.Bind(
                PMCConfig,
                "Distance Limit - GroundZero",
                85f, new ConfigDescription("How far all PMCs must be from a spawn point for it to be enabled for other PMC spawns.\n Setting this too high will cause PMCs to fail to spawn.", 
                new AcceptableValueRange<float>(10f, 175f), 
                new ConfigurationManagerAttributes { Order = loadOrder-- }));
            PMCDistancePatch.groundZero_PMCSpawnDistanceCheck = groundZero_PMCSpawnDistanceCheck.Value;
            groundZero_PMCSpawnDistanceCheck.SettingChanged += ABPS_SettingChanged;

            shoreline_PMCSpawnDistanceCheck = config.Bind(
                PMCConfig,
                "Distance Limit - Shoreline", 
                130f, new ConfigDescription("How far all PMCs must be from a spawn point for it to be enabled for other PMC spawns.\n Setting this too high will cause PMCs to fail to spawn.", 
                new AcceptableValueRange<float>(10f, 175f), 
                new ConfigurationManagerAttributes { Order = loadOrder-- }));
            PMCDistancePatch.shoreline_PMCSpawnDistanceCheck = shoreline_PMCSpawnDistanceCheck.Value;
            shoreline_PMCSpawnDistanceCheck.SettingChanged += ABPS_SettingChanged;

            streets_PMCSpawnDistanceCheck = config.Bind(
                PMCConfig,
                "Distance Limit - Streets", 
                120f, new ConfigDescription("How far all PMCs must be from a spawn point for it to be enabled for other PMC spawns.\n Setting this too high will cause PMCs to fail to spawn.", 
                new AcceptableValueRange<float>(10f, 175f), 
                new ConfigurationManagerAttributes { Order = loadOrder-- }));
            PMCDistancePatch.streets_PMCSpawnDistanceCheck = streets_PMCSpawnDistanceCheck.Value;
            streets_PMCSpawnDistanceCheck.SettingChanged += ABPS_SettingChanged;

            woods_PMCSpawnDistanceCheck = config.Bind(
                PMCConfig,
                "Distance Limit - Woods", 
                150f, 
                new ConfigDescription("How far all PMCs must be from a spawn point for it to be enabled for other PMC spawns.\n Setting this too high will cause PMCs to fail to spawn.", 
                new AcceptableValueRange<float>(10f, 175f), 
                new ConfigurationManagerAttributes { Order = loadOrder-- }));
            PMCDistancePatch.woods_PMCSpawnDistanceCheck = woods_PMCSpawnDistanceCheck.Value;
            woods_PMCSpawnDistanceCheck.SettingChanged += ABPS_SettingChanged;


            // Scav Settings

            _softCap = config.Bind(
                ScavConfig, 
                "Scav Soft Cap", 
                3, 
                new ConfigDescription("How many open slots before hard cap to stop spawning additional scavs.\nEx..If 3, and map cap is 23 - will stop spawning scavs at 20 total.\nThis allows PMC waves if enabled to fill the remaining spots.", 
                new AcceptableValueRange<int>(0, 10), 
                new ConfigurationManagerAttributes { Order = loadOrder-- }));
            NonWavesSpawnScenarioUpdatePatch._softCap = _softCap.Value;
            _softCap.SettingChanged += ABPS_SettingChanged;

            _pScavChance = config.Bind(
                ScavConfig, 
                "PScav Chance", 
                20, 
                new ConfigDescription("How likely a scav spawning later in the raid is a Player Scav.",
                new AcceptableValueRange<int>(0, 100),
                new ConfigurationManagerAttributes { Order = loadOrder-- }));
            NonWavesSpawnScenarioUpdatePatch._pScavChance = _pScavChance.Value;
            _pScavChance.SettingChanged += ABPS_SettingChanged;

            customs_ScavSpawnDistanceCheck = config.Bind(
                ScavConfig, 
                "Distance Limit - Customs", 
                45f, 
                new ConfigDescription("How far PMCs must be from a spawn point for it to be enabled for Scav spawns.\n Setting this too high will cause Scavs to fail to spawn.",
                new AcceptableValueRange<float>(5f, 100f),
                new ConfigurationManagerAttributes { Order = loadOrder-- }));
            TryToSpawnInZonePatch.customs_ScavSpawnDistanceCheck = customs_ScavSpawnDistanceCheck.Value;
            customs_ScavSpawnDistanceCheck.SettingChanged += ABPS_SettingChanged;

            factory_ScavSpawnDistanceCheck = config.Bind(
                ScavConfig, 
                "Distance Limit - Factory", 
                30f, 
                new ConfigDescription("How far PMCs must be from a spawn point for it to be enabled for Scav spawns.\n Setting this too high will cause Scavs to fail to spawn.",
                new AcceptableValueRange<float>(5f, 100f),
                new ConfigurationManagerAttributes { Order = loadOrder-- }));
            TryToSpawnInZonePatch.factory_ScavSpawnDistanceCheck = factory_ScavSpawnDistanceCheck.Value;
            factory_ScavSpawnDistanceCheck.SettingChanged += ABPS_SettingChanged;

            interchange_ScavSpawnDistanceCheck = config.Bind(
                ScavConfig,
                "Distance Limit - Interchange",
                45f, 
                new ConfigDescription("How far PMCs must be from a spawn point for it to be enabled for Scav spawns.\n Setting this too high will cause Scavs to fail to spawn.",
                new AcceptableValueRange<float>(1f, 50f),
                new ConfigurationManagerAttributes { Order = loadOrder-- }));
            TryToSpawnInZonePatch.interchange_ScavSpawnDistanceCheck = interchange_ScavSpawnDistanceCheck.Value;
            interchange_ScavSpawnDistanceCheck.SettingChanged += ABPS_SettingChanged;

            labs_ScavSpawnDistanceCheck = config.Bind(
                ScavConfig,
                "Distance Limit - Labs", 
                40f, 
                new ConfigDescription("How far PMCs must be from a spawn point for it to be enabled for Scav spawns.\n Setting this too high will cause Scavs to fail to spawn.",
                new AcceptableValueRange<float>(1f, 50f),
                new ConfigurationManagerAttributes { Order = loadOrder-- }));
            TryToSpawnInZonePatch.labs_ScavSpawnDistanceCheck = labs_ScavSpawnDistanceCheck.Value;
            labs_ScavSpawnDistanceCheck.SettingChanged += ABPS_SettingChanged;

            lighthouse_ScavSpawnDistanceCheck = config.Bind
                (ScavConfig,
                "Distance Limit - Lighthouse",
                45f, 
                new ConfigDescription("How far PMCs must be from a spawn point for it to be enabled for Scav spawns.\n Setting this too high will cause Scavs to fail to spawn.",
                new AcceptableValueRange<float>(1f, 50f),
                new ConfigurationManagerAttributes { Order = loadOrder-- }));
            TryToSpawnInZonePatch.lighthouse_ScavSpawnDistanceCheck = lighthouse_ScavSpawnDistanceCheck.Value;
            lighthouse_ScavSpawnDistanceCheck.SettingChanged += ABPS_SettingChanged;

            reserve_ScavSpawnDistanceCheck = config.Bind(
                ScavConfig,
                "Distance Limit - Reserve",
                45f, 
                new ConfigDescription("How far PMCs must be from a spawn point for it to be enabled for Scav spawns.\n Setting this too high will cause Scavs to fail to spawn.",
                new AcceptableValueRange<float>(1f, 50f),
                new ConfigurationManagerAttributes { Order = loadOrder-- }));
            TryToSpawnInZonePatch.reserve_ScavSpawnDistanceCheck = reserve_ScavSpawnDistanceCheck.Value;
            reserve_ScavSpawnDistanceCheck.SettingChanged += ABPS_SettingChanged;

            groundZero_ScavSpawnDistanceCheck = config.Bind(
                ScavConfig,
                "Distance Limit - GroundZero",
                45f, 
                new ConfigDescription("How far PMCs must be from a spawn point for it to be enabled for Scav spawns.\n Setting this too high will cause Scavs to fail to spawn.",
                new AcceptableValueRange<float>(1f, 50f),
                new ConfigurationManagerAttributes { Order = loadOrder-- }));
            TryToSpawnInZonePatch.groundZero_ScavSpawnDistanceCheck = groundZero_ScavSpawnDistanceCheck.Value;
            groundZero_ScavSpawnDistanceCheck.SettingChanged += ABPS_SettingChanged;

            shoreline_ScavSpawnDistanceCheck = config.Bind(
                ScavConfig,
                "Distance Limit - Shoreline",
                45f, 
                new ConfigDescription("How far PMCs must be from a spawn point for it to be enabled for Scav spawns.\n Setting this too high will cause Scavs to fail to spawn.",
                new AcceptableValueRange<float>(1f, 50f),
                new ConfigurationManagerAttributes { Order = loadOrder-- }));
            TryToSpawnInZonePatch.shoreline_ScavSpawnDistanceCheck = shoreline_ScavSpawnDistanceCheck.Value;
            shoreline_ScavSpawnDistanceCheck.SettingChanged += ABPS_SettingChanged;

            streets_ScavSpawnDistanceCheck = config.Bind(
                ScavConfig,
                "Distance Limit - Streets",
                45f, 
                new ConfigDescription("How far PMCs must be from a spawn point for it to be enabled for Scav spawns.\n Setting this too high will cause Scavs to fail to spawn.",
                new AcceptableValueRange<float>(1f, 50f),
                new ConfigurationManagerAttributes { Order = loadOrder-- }));
            TryToSpawnInZonePatch.streets_ScavSpawnDistanceCheck = streets_ScavSpawnDistanceCheck.Value;
            streets_ScavSpawnDistanceCheck.SettingChanged += ABPS_SettingChanged;

            woods_ScavSpawnDistanceCheck = config.Bind(
                ScavConfig,
                "Distance Limit - Woods",
                45f, 
                new ConfigDescription("How far PMCs must be from a spawn point for it to be enabled for Scav spawns.\n Setting this too high will cause Scavs to fail to spawn.",
                new AcceptableValueRange<float>(1f, 50f),
                new ConfigurationManagerAttributes { Order = loadOrder-- }));
            TryToSpawnInZonePatch.woods_ScavSpawnDistanceCheck = woods_ScavSpawnDistanceCheck.Value;
            woods_ScavSpawnDistanceCheck.SettingChanged += ABPS_SettingChanged;
        }
        private static void ABPS_SettingChanged(object sender, EventArgs e)
        {
            BossSpawnTracking.progressiveChances = progressiveChances.Value;
            BossSpawnTracking.chanceStep = chanceStep.Value;
            BossSpawnTracking.minimumChance = minimumChance.Value;
            BossSpawnTracking.maximumChance = maximumChance.Value;

            PMCDistancePatch.customs_PMCSpawnDistanceCheck = customs_PMCSpawnDistanceCheck.Value;
            PMCDistancePatch.factory_PMCSpawnDistanceCheck = factory_PMCSpawnDistanceCheck.Value;
            PMCDistancePatch.interchange_PMCSpawnDistanceCheck = interchange_PMCSpawnDistanceCheck.Value;
            PMCDistancePatch.labs_PMCSpawnDistanceCheck = labs_PMCSpawnDistanceCheck.Value;
            PMCDistancePatch.lighthouse_PMCSpawnDistanceCheck = lighthouse_PMCSpawnDistanceCheck.Value;
            PMCDistancePatch.reserve_PMCSpawnDistanceCheck = reserve_PMCSpawnDistanceCheck.Value;
            PMCDistancePatch.groundZero_PMCSpawnDistanceCheck = groundZero_PMCSpawnDistanceCheck.Value;
            PMCDistancePatch.shoreline_PMCSpawnDistanceCheck = shoreline_PMCSpawnDistanceCheck.Value;
            PMCDistancePatch.streets_PMCSpawnDistanceCheck = streets_PMCSpawnDistanceCheck.Value;
            PMCDistancePatch.woods_PMCSpawnDistanceCheck = woods_PMCSpawnDistanceCheck.Value;


            NonWavesSpawnScenarioUpdatePatch._softCap = _softCap.Value;
            NonWavesSpawnScenarioUpdatePatch._pScavChance = _pScavChance.Value;
            TryToSpawnInZonePatch.customs_ScavSpawnDistanceCheck = customs_ScavSpawnDistanceCheck.Value;
            TryToSpawnInZonePatch.factory_ScavSpawnDistanceCheck = factory_ScavSpawnDistanceCheck.Value;
            TryToSpawnInZonePatch.interchange_ScavSpawnDistanceCheck = interchange_ScavSpawnDistanceCheck.Value;
            TryToSpawnInZonePatch.labs_ScavSpawnDistanceCheck = labs_ScavSpawnDistanceCheck.Value;
            TryToSpawnInZonePatch.lighthouse_ScavSpawnDistanceCheck = lighthouse_ScavSpawnDistanceCheck.Value;
            TryToSpawnInZonePatch.reserve_ScavSpawnDistanceCheck = reserve_ScavSpawnDistanceCheck.Value;
            TryToSpawnInZonePatch.groundZero_ScavSpawnDistanceCheck = groundZero_ScavSpawnDistanceCheck.Value;
            TryToSpawnInZonePatch.shoreline_ScavSpawnDistanceCheck = shoreline_ScavSpawnDistanceCheck.Value;
            TryToSpawnInZonePatch.streets_ScavSpawnDistanceCheck = streets_ScavSpawnDistanceCheck.Value;
            TryToSpawnInZonePatch.woods_ScavSpawnDistanceCheck = woods_ScavSpawnDistanceCheck.Value;
        }
    }
}

using acidphantasm_botplacementsystem.Patches;
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

        private const string ConfigGeneral = "1. General";
        public static ConfigEntry<int> _softCap;

        private const string LocationConfig = "2. Location Settings";
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

        public static void InitABPSConfig(ConfigFile config)
        {
            // General Settings
            _softCap = config.Bind(ConfigGeneral, "Scav Soft Cap", 3, new ConfigDescription("How many open slots before hard cap to stop spawning additional scavs.", null, new ConfigurationManagerAttributes { Order = loadOrder-- }));
            NonWavesSpawnScenarioUpdatePatch._softCap = _softCap.Value;
            _softCap.SettingChanged += ABPS_SettingChanged;


            // Location Settings
            customs_PMCSpawnDistanceCheck = config.Bind(ConfigGeneral, "Customs PMC Spawn Distance Limit", 125f, new ConfigDescription("How far PMCs must be to allow a spawn point to be enabled.", null, new ConfigurationManagerAttributes { Order = loadOrder-- }));
            PMCDistancePatch.customs_PMCSpawnDistanceCheck = customs_PMCSpawnDistanceCheck.Value;
            customs_PMCSpawnDistanceCheck.SettingChanged += ABPS_SettingChanged;

            factory_PMCSpawnDistanceCheck = config.Bind(ConfigGeneral, "Factory PMC Spawn Distance Limit", 70f, new ConfigDescription("How far PMCs must be to allow a spawn point to be enabled.", null, new ConfigurationManagerAttributes { Order = loadOrder-- }));
            PMCDistancePatch.factory_PMCSpawnDistanceCheck = factory_PMCSpawnDistanceCheck.Value;
            factory_PMCSpawnDistanceCheck.SettingChanged += ABPS_SettingChanged;

            interchange_PMCSpawnDistanceCheck = config.Bind(ConfigGeneral, "Interchange PMC Spawn Distance Limit", 150f, new ConfigDescription("How far PMCs must be to allow a spawn point to be enabled.", null, new ConfigurationManagerAttributes { Order = loadOrder-- }));
            PMCDistancePatch.interchange_PMCSpawnDistanceCheck = interchange_PMCSpawnDistanceCheck.Value;
            interchange_PMCSpawnDistanceCheck.SettingChanged += ABPS_SettingChanged;

            labs_PMCSpawnDistanceCheck = config.Bind(ConfigGeneral, "Labs PMC Spawn Distance Limit", 70f, new ConfigDescription("How far PMCs must be to allow a spawn point to be enabled.", null, new ConfigurationManagerAttributes { Order = loadOrder-- }));
            PMCDistancePatch.labs_PMCSpawnDistanceCheck = labs_PMCSpawnDistanceCheck.Value;
            labs_PMCSpawnDistanceCheck.SettingChanged += ABPS_SettingChanged;

            lighthouse_PMCSpawnDistanceCheck = config.Bind(ConfigGeneral, "Lighthouse PMC Spawn Distance Limit", 150f, new ConfigDescription("How far PMCs must be to allow a spawn point to be enabled.", null, new ConfigurationManagerAttributes { Order = loadOrder-- }));
            PMCDistancePatch.lighthouse_PMCSpawnDistanceCheck = lighthouse_PMCSpawnDistanceCheck.Value;
            lighthouse_PMCSpawnDistanceCheck.SettingChanged += ABPS_SettingChanged;

            reserve_PMCSpawnDistanceCheck = config.Bind(ConfigGeneral, "Reserve PMC Spawn Distance Limit", 125f, new ConfigDescription("How far PMCs must be to allow a spawn point to be enabled.", null, new ConfigurationManagerAttributes { Order = loadOrder-- }));
            PMCDistancePatch.reserve_PMCSpawnDistanceCheck = reserve_PMCSpawnDistanceCheck.Value;
            reserve_PMCSpawnDistanceCheck.SettingChanged += ABPS_SettingChanged;
            
            groundZero_PMCSpawnDistanceCheck = config.Bind(ConfigGeneral, "GroundZero PMC Spawn Distance Limit", 125f, new ConfigDescription("How far PMCs must be to allow a spawn point to be enabled.", null, new ConfigurationManagerAttributes { Order = loadOrder-- }));
            PMCDistancePatch.groundZero_PMCSpawnDistanceCheck = groundZero_PMCSpawnDistanceCheck.Value;
            groundZero_PMCSpawnDistanceCheck.SettingChanged += ABPS_SettingChanged;

            shoreline_PMCSpawnDistanceCheck = config.Bind(ConfigGeneral, "Shoreline PMC Spawn Distance Limit", 150f, new ConfigDescription("How far PMCs must be to allow a spawn point to be enabled.", null, new ConfigurationManagerAttributes { Order = loadOrder-- }));
            PMCDistancePatch.shoreline_PMCSpawnDistanceCheck = shoreline_PMCSpawnDistanceCheck.Value;
            shoreline_PMCSpawnDistanceCheck.SettingChanged += ABPS_SettingChanged;

            streets_PMCSpawnDistanceCheck = config.Bind(ConfigGeneral, "Streets PMC Spawn Distance Limit", 150f, new ConfigDescription("How far PMCs must be to allow a spawn point to be enabled.", null, new ConfigurationManagerAttributes { Order = loadOrder-- }));
            PMCDistancePatch.streets_PMCSpawnDistanceCheck = streets_PMCSpawnDistanceCheck.Value;
            streets_PMCSpawnDistanceCheck.SettingChanged += ABPS_SettingChanged;

            woods_PMCSpawnDistanceCheck = config.Bind(ConfigGeneral, "Woods PMC Spawn Distance Limit", 175f, new ConfigDescription("How far PMCs must be to allow a spawn point to be enabled.", null, new ConfigurationManagerAttributes { Order = loadOrder-- }));
            PMCDistancePatch.woods_PMCSpawnDistanceCheck = woods_PMCSpawnDistanceCheck.Value;
            woods_PMCSpawnDistanceCheck.SettingChanged += ABPS_SettingChanged;
        }
        private static void ABPS_SettingChanged(object sender, EventArgs e)
        {
            NonWavesSpawnScenarioUpdatePatch._softCap = _softCap.Value;
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
        }
    }
}

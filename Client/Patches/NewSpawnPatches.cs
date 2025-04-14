using acidphantasm_botplacementsystem.Utils;
using Comfort.Common;
using EFT;
using EFT.Game.Spawning;
using HarmonyLib;
using SPT.Reflection.Patching;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using UnityEngine;

namespace acidphantasm_botplacementsystem.Patches
{
    internal class AssaultGroupPatch : ModulePatch
    {
        protected override MethodBase GetTargetMethod()
        {
            return AccessTools.Method(typeof(ProfileInfoSettingsClass), nameof(ProfileInfoSettingsClass.TryChangeRoleToAssaultGroup));
        }

        [PatchPrefix]
        private static bool PatchPrefix(ProfileInfoSettingsClass __instance)
        {
            if(__instance.Role == WildSpawnType.assaultGroup)
            {
                __instance.Role = WildSpawnType.assault;
            }
            return false;
        }
    }
    internal class NonWavesSpawnScenarioUpdatePatch : ModulePatch
    {
        public static int _softCap;
        public static int _pScavChance;
        protected override MethodBase GetTargetMethod()
        {
            return AccessTools.Method(typeof(NonWavesSpawnScenario), nameof(NonWavesSpawnScenario.Update));
        }

        [PatchPrefix]
        private static bool PatchPrefix(
            NonWavesSpawnScenario __instance,
            ref BotsController ___botsController_0,
            ref AbstractGame ___abstractGame_0,
            ref LocationSettingsClass.Location ___location_0,
            ref GClass1652<BotDifficulty> ___gclass1652_0,
            ref GClass1652<WildSpawnType> ___gclass1652_1,
            ref GClass1647 ___gclass1647_0,
            ref bool ___bool_0,
            ref bool ___bool_1,
            ref bool ___bool_2,
            ref float ___nullable_0,
            ref float ___float_2,
            ref float ___float_0)
        {
            if (__instance == null || !___bool_1) return true;

            if (___abstractGame_0.PastTime < (float)___location_0.BotStart || ___abstractGame_0.PastTime > (float)___location_0.BotStop)
            {
                return false;
            }
            if (___nullable_0.Equals(null) || ___nullable_0 <= ___abstractGame_0.PastTime)
            {
                ___bool_2 = !___bool_2;
                float newFloat = (___abstractGame_0.PastTime + (___bool_2 ? GClass835.Random((float)___location_0.BotSpawnTimeOnMin, (float)___location_0.BotSpawnTimeOnMax) : GClass835.Random((float)___location_0.BotSpawnTimeOffMin, (float)___location_0.BotSpawnTimeOffMax)));
                ___nullable_0 = newFloat;
            }
            if (!___bool_2)
            {
                return false;
            }
            if (___abstractGame_0.PastTime - ___float_0 < ___float_2)
            {
                return false;
            }
            ___float_0 = ___abstractGame_0.PastTime;
            int num = (___botsController_0._maxCount - _softCap) - ___botsController_0.AliveLoadingDelayedBotsCount;
            if (___bool_0)
            {
                if (num < ___location_0.BotSpawnCountStep)
                {
                    return false;
                }
                ___float_2 = 10f;
                ___bool_0 = false;
            }
            else if (num <= 0)
            {
                if (!___bool_0)
                {
                    ___float_2 = (float)___location_0.BotSpawnPeriodCheck;
                    if (___float_2 < 10f)
                    {
                        ___float_2 = 10f;
                    }
                    ___bool_0 = ___botsController_0._maxCount - ___botsController_0.AliveAndLoadingBotsCount <= 0;
                }
                return false;
            }

            num = ___gclass1647_0.TrySpawn(num, ___botsController_0, ___gclass1652_0);

            for (int i = 0; i < num; i++)
            {
                //Logger.LogInfo("Sending spawn data from new spawn system");
                var wildSpawn = WildSpawnType.assault;
                var botZone = GetValidBotZone(wildSpawn, 1, ___botsController_0.BotSpawner._allBotZones);

                BotWaveDataClass botWaveDataClass = new BotWaveDataClass
                {
                    BotsCount = 1,
                    Time = Time.time,
                    Difficulty = ___gclass1652_0.Random(),
                    IsPlayers = GClass835.IsTrue100(_pScavChance) ? true : false,
                    Side = EPlayerSide.Savage,
                    WildSpawnType = wildSpawn,
                    SpawnAreaName = botZone,
                    WithCheckMinMax = false,
                    ChanceGroup = 0,
                };

                ___botsController_0.ActivateBotsByWave(botWaveDataClass);
            }
            return false;

            /*
            for (int i = 0; i < num; i++)
            {
                Logger.LogInfo("New Spawn System inside trigger");
                WildSpawnType wildSpawnType = ___gclass1652_1.Random();
                BotDifficulty botDifficulty = ___gclass1652_0.Random();
                GClass663 gclass = new GClass663(EPlayerSide.Savage, wildSpawnType, botDifficulty, 0f, null);
                ___botsController_0.ActivateBotsWithoutWave(1, gclass);
            }
            */
        }

        private static string GetValidBotZone(WildSpawnType botType, int count, BotZone[] allZones)
        {
            List<BotZone> botZones = allZones.ToList().Where(x => !x.SnipeZone).ToList();
            botZones = botZones.OrderBy(_ => Guid.NewGuid()).ToList();

            for (int i = 0; i < botZones.Count; i++)
            {
                BotZone currentZone = botZones[i];
                if (currentZone.HaveFreeSpace(1))
                {
                    //Logger.LogInfo($"Selected BotZone: {currentZone.NameZone}");
                    return currentZone.NameZone;
                }
            }

            return "";
        }
    }
    internal class TryToSpawnInZonePatch : ModulePatch
    {
        protected override MethodBase GetTargetMethod()
        {
            return AccessTools.Method(typeof(BotSpawner), nameof(BotSpawner.TryToSpawnInZoneAndDelay));
        }

        [PatchPrefix]
        private static void PatchPrefix(BotSpawner __instance, BotZone botZone, BotCreationDataClass data, bool withCheckMinMax, bool newWave, ref List<ISpawnPoint> pointsToSpawn, bool forcedSpawn = false)
        {
            if (data.IsValidSpawnType(WildSpawnType.assault) && pointsToSpawn == null)
            {
                //Logger.LogInfo("TryToSpawnInZoneAndDelay Hit with empty spawn points and is a scav/marksman");

                string mapName = Utility.GetCurrentLocation();
                List<IPlayer> pmcList = Utility.GetAllPMCs();
                List<IPlayer> scavList = Utility.GetAllPMCs();
                float distance = GetDistanceForMap(mapName);
                WildSpawnType botType = data.Profiles[0].Info.Settings.Role;

                pointsToSpawn = GetValidSpawnPoints(botZone, mapName, pmcList, scavList, distance, botType);
            }
        }

        public static float customs_ScavSpawnDistanceCheck;
        public static float factory_ScavSpawnDistanceCheck;
        public static float interchange_ScavSpawnDistanceCheck;
        public static float labs_ScavSpawnDistanceCheck;
        public static float lighthouse_ScavSpawnDistanceCheck;
        public static float reserve_ScavSpawnDistanceCheck;
        public static float groundZero_ScavSpawnDistanceCheck;
        public static float shoreline_ScavSpawnDistanceCheck;
        public static float streets_ScavSpawnDistanceCheck;
        public static float woods_ScavSpawnDistanceCheck;

        private static List<ISpawnPoint> GetValidSpawnPoints(BotZone botZone, string location, IReadOnlyCollection<IPlayer> pmcList, IReadOnlyCollection<IPlayer> scavList, float distance, WildSpawnType botType)
        {
            List<ISpawnPoint> validSpawnPoints = new List<ISpawnPoint>();
            List<ISpawnPoint> allSpawnPoints = botZone.SpawnPoints.ToList()
                .Where(x => x.Categories == ESpawnCategoryMask.All || x.Categories.ContainBotCategory())
                .ToList();

            allSpawnPoints = allSpawnPoints.OrderBy(_ => Guid.NewGuid()).ToList();

            int count = 0;
            for (int i = 0; i < allSpawnPoints.Count; i++)
            {
                ISpawnPoint checkPoint = allSpawnPoints[i];
                count++;
                //Logger.LogInfo($"Checking spawn point: {count}/{allSpawnPoints.Count}");
                if (IsValid(checkPoint, pmcList, distance) && IsValid(checkPoint, scavList, 15f))
                {
                    //Logger.LogInfo($"Adding initial point: {count}/{allSpawnPoints.Count}");
                    validSpawnPoints.Add(checkPoint); 
                    return validSpawnPoints;
                }
            }
            return validSpawnPoints;
        }
        private static bool IsValid(ISpawnPoint spawnPoint, IReadOnlyCollection<IPlayer> players, float distance)
        {
            if (spawnPoint == null) return false;
            if (spawnPoint.Collider == null) return false;
            if (players != null && players.Count != 0)
            {
                foreach (IPlayer player in players)
                {
                    if (player == null || player.Profile.GetCorrectedNickname().StartsWith("headless_"))
                    {
                        //Logger.LogInfo("Player is null or headless client, skip");
                        continue;
                    }
                    if (spawnPoint.Collider.Contains(player.Position))
                    {
                        return false;
                    }
                    if (Vector3.Distance(spawnPoint.Position, player.Position) < distance)
                    {
                        return false;
                    }
                }
                //Logger.LogInfo($"Point is valid after checking {players.Count}");
                return true;
            }
            return true;
        }
        private static float GetDistanceForMap(string mapName)
        {
            mapName = mapName.ToLower();
            float distanceLimit = 10f;
            switch (mapName)
            {
                case "bigmap":
                    distanceLimit = customs_ScavSpawnDistanceCheck;
                    return distanceLimit;
                case "factory4_day":
                case "factory4_night":
                    distanceLimit = factory_ScavSpawnDistanceCheck;
                    return distanceLimit;
                case "interchange":
                    distanceLimit = interchange_ScavSpawnDistanceCheck;
                    return distanceLimit;
                case "laboratory":
                    distanceLimit = labs_ScavSpawnDistanceCheck;
                    return distanceLimit;
                case "lighthouse":
                    distanceLimit = lighthouse_ScavSpawnDistanceCheck;
                    return distanceLimit;
                case "rezervbase":
                    distanceLimit = reserve_ScavSpawnDistanceCheck;
                    return distanceLimit;
                case "sandbox":
                case "sandbox_high":
                    distanceLimit = groundZero_ScavSpawnDistanceCheck;
                    return distanceLimit;
                case "shoreline":
                    distanceLimit = shoreline_ScavSpawnDistanceCheck;
                    return distanceLimit;
                case "tarkovstreets":
                    distanceLimit = streets_ScavSpawnDistanceCheck;
                    return distanceLimit;
                case "woods":
                    distanceLimit = woods_ScavSpawnDistanceCheck;
                    return distanceLimit;
                default:
                    return distanceLimit;
            }
        }
    }
}

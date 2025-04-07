using acidphantasm_botplacementsystem.Utils;
using BepInEx.Configuration;
using Comfort.Common;
using EFT;
using EFT.Game.Spawning;
using HarmonyLib;
using SPT.Reflection.Patching;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using UnityEngine;
using UnityEngine.Profiling;

namespace acidphantasm_botplacementsystem.Patches
{
    internal class PMCWaveCountPatch : ModulePatch
    {
        public static int _BossWaveCount = 0;
        protected override MethodBase GetTargetMethod()
        {
            return AccessTools.Method(typeof(BossSpawnScenario), nameof(BossSpawnScenario.method_0));
        }

        [PatchPostfix]
        private static void PatchPostfix(BossSpawnScenario __instance, BossLocationSpawn[] bossWaves)
        {
            if (__instance == null) return;
            List<BossLocationSpawn> pmcWaveCount = bossWaves.Where(x => x.BossName == "pmcUSEC" || x.BossName == "pmcBEAR").ToList();
            _BossWaveCount = pmcWaveCount.Count;
            Utility.currentMapZones = new List<BotZone>();
            Utility.mapName = string.Empty;
            Utility.allPMCs = new List<IPlayer>();
        }
    }
    internal class PMCDistancePatch : ModulePatch
    {
        protected override MethodBase GetTargetMethod()
        {
            return AccessTools.Method(typeof(BossSpawnerClass), nameof(BossSpawnerClass.method_2));
        }

        [PatchPrefix]
        private static bool PatchPrefix(BossSpawnerClass __instance, BossLocationSpawn wave, BotSpawnParams spawnParams, BotDifficulty difficulty, int followersCount, BotCreationDataClass creationData, ref bool __result)
        {
            if (__instance == null)
            {
                return true;
            }

            Logger.LogInfo($"Spawn Attempt: {creationData.Profiles[0].Nickname} | WaveBossType: {wave.BossType}");
            if (wave.BossType != WildSpawnType.pmcBEAR && wave.BossType != WildSpawnType.pmcUSEC)
            {
                return true;
            }

            if (PMCWaveCountPatch._BossWaveCount <= usedSpawnPoints.Count) usedSpawnPoints.Clear();

            if (Utility.currentMapZones.Count == 0)
            {
                Utility.currentMapZones = wave.GetPossibleZones(__instance.botZone_0, __instance.botZone_0.ToList()).Where(x => !x.SnipeZone).ToList();
            }

            List<BotZone> botZones = Utility.GetMapBotZones();

            List<IPlayer> playerList = Utility.GetAllPMCs();

            bool flag2 = wave.BossType.IsSectant();
            for (int i = 0; i < botZones.Count; i++)
            {
                BotZone botZone = botZones[i];

                int soloPointCount = 1;
                int escortPointCount = 1 + wave.EscortCount;

                string location = Utility.GetCurrentLocation() ?? "default";
                float distance = GetDistanceForMap(location);
                List<ISpawnPoint> validSpawnLocations = GetValidSpawnPoints(botZone, playerList, distance);
                if (validSpawnLocations.Count >= soloPointCount)
                {
                    if (validSpawnLocations.Count < escortPointCount && validSpawnLocations.Count > 0)
                    {
                        int num4 = escortPointCount - validSpawnLocations.Count;
                        ISpawnPoint spawnPoint = validSpawnLocations[0];
                        for (int j = 0; j < num4; j++)
                        {
                            validSpawnLocations.Add(spawnPoint);
                        }
                    }
                    if (validSpawnLocations.Count >= escortPointCount)
                    {
                        __instance.float_1 = Time.time;
                        __instance.wildSpawnType_0 = wave.BossType;
                        __instance.botZone_1 = botZone;

                        if (creationData.SpawnStopped)
                        {
                            __result = false;
                            return false;
                        }
                        __instance.method_3(creationData, wave, spawnParams, followersCount, botZone, validSpawnLocations);
                        __result = true;
                        return false;
                    }
                }
            }

            return true;
        }
        public static List<ISpawnPoint> usedSpawnPoints = new List<ISpawnPoint>();
        private static List<ISpawnPoint> GetValidSpawnPoints(BotZone botZone, IReadOnlyCollection<IPlayer> players, float distance)
        {
            List<ISpawnPoint> validSpawnPoints = new List<ISpawnPoint>();
            List<ISpawnPoint> list = botZone.SpawnPoints.ToList()
                .Where(x => !x.Categories.ContainBossCategory())
                .ToList();
            
            int count = 1;
            for (int i = 0; i < list.Count; i++)
            {
                //Logger.LogInfo($"Checking point: {count}/{list.Count} for Zone: {botZone.NameZone}");
                ISpawnPoint checkPoint = list[i];
                if (IsValid(checkPoint, players, distance))
                {
                    //Logger.LogInfo($"Point is valid distance away: {count}/{list.Count}");
                    if (usedSpawnPoints.Contains(checkPoint))
                    {
                        //Logger.LogInfo($"Point is already used: {count}/{list.Count}");
                        count++;
                        continue;
                    }

                    bool pointIsDistantFromAlreadySelectedPoints = false;
                    if (usedSpawnPoints.Count == 0)
                    {
                        //Logger.LogInfo($"Used Spawn Point Count is 0: {count}/{list.Count}");
                        pointIsDistantFromAlreadySelectedPoints = true;
                    }

                    if (!pointIsDistantFromAlreadySelectedPoints)
                    {
                        //Logger.LogInfo($"Checking used points for distance: {count}/{list.Count}");
                        for (int j = 0; j < usedSpawnPoints.Count; j++)
                        {
                            //Logger.LogInfo($"Checking used point: {j+1}/{usedSpawnPoints.Count}");
                            if (pointIsDistantFromAlreadySelectedPoints) break;
                            ISpawnPoint pointToCheckAgainst = usedSpawnPoints[j];
                            //Logger.LogInfo($"Checking used point distance: {j+1}/{usedSpawnPoints.Count}");
                            if (Vector3.Distance(checkPoint.Position, pointToCheckAgainst.Position) <= distance)
                            {
                                //Logger.LogInfo($"Used point is too close, skip to next: {j+1}/{usedSpawnPoints.Count}");
                                continue;
                            }
                            //Logger.LogInfo($"Used point is far enough: {j+1}/{usedSpawnPoints.Count - 1}");
                            pointIsDistantFromAlreadySelectedPoints = true;
                        }
                    }                    

                    if (pointIsDistantFromAlreadySelectedPoints)
                    {
                        //Logger.LogInfo($"Adding initial point: {count}/{list.Count}");
                        validSpawnPoints.Add(checkPoint);
                        usedSpawnPoints.Add(checkPoint);
                        break;
                    }
                }
                //else Logger.LogInfo($"Point is not valid: {count}/{list.Count}");
                count++;
            }
            //Logger.LogInfo($"Returning collected valid points {validSpawnPoints.Count}");
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
                        Logger.LogInfo("Player is null or headless client, skip");
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

        public static float customs_PMCSpawnDistanceCheck;
        public static float factory_PMCSpawnDistanceCheck;
        public static float interchange_PMCSpawnDistanceCheck;
        public static float labs_PMCSpawnDistanceCheck;
        public static float lighthouse_PMCSpawnDistanceCheck;
        public static float reserve_PMCSpawnDistanceCheck;
        public static float groundZero_PMCSpawnDistanceCheck;
        public static float shoreline_PMCSpawnDistanceCheck;
        public static float streets_PMCSpawnDistanceCheck;
        public static float woods_PMCSpawnDistanceCheck;
        private static float GetDistanceForMap(string mapName)
        {
            mapName = mapName.ToLower();
            float distanceLimit = 100f;
            switch (mapName)
            {
                case "bigmap":
                    distanceLimit = customs_PMCSpawnDistanceCheck;
                    Logger.LogInfo($"Customs Distance Limit {distanceLimit}");
                    return distanceLimit;
                case "factory4_day":
                case "factory4_night":
                    distanceLimit = factory_PMCSpawnDistanceCheck;
                    Logger.LogInfo($"Factory Distance Limit {distanceLimit}");
                    return distanceLimit;
                case "interchange":
                    distanceLimit = interchange_PMCSpawnDistanceCheck;
                    Logger.LogInfo($"Interchange Distance Limit {distanceLimit}");
                    return distanceLimit;
                case "laboratory":
                    distanceLimit = labs_PMCSpawnDistanceCheck;
                    Logger.LogInfo($"Labs Distance Limit {distanceLimit}");
                    return distanceLimit;
                case "lighthouse":
                    distanceLimit = lighthouse_PMCSpawnDistanceCheck;
                    Logger.LogInfo($"Lighthouse Distance Limit {distanceLimit}");
                    return distanceLimit;
                case "rezervbase":
                    distanceLimit = reserve_PMCSpawnDistanceCheck;
                    Logger.LogInfo($"Reserve Distance Limit {distanceLimit}");
                    return distanceLimit;
                case "sandbox":
                case "sandbox_high":
                    distanceLimit = groundZero_PMCSpawnDistanceCheck;
                    Logger.LogInfo($"GroundZero Distance Limit {distanceLimit}");
                    return distanceLimit;
                case "shoreline":
                    distanceLimit = shoreline_PMCSpawnDistanceCheck;
                    Logger.LogInfo($"Shoreline Distance Limit {distanceLimit}");
                    return distanceLimit;
                case "tarkovstreets":
                    distanceLimit = streets_PMCSpawnDistanceCheck;
                    Logger.LogInfo($"Streets Distance Limit {distanceLimit}");
                    return distanceLimit;
                case "woods":
                    distanceLimit = woods_PMCSpawnDistanceCheck;
                    Logger.LogInfo($"Woods Distance Limit {distanceLimit}");
                    return distanceLimit;
                default:
                    distanceLimit = 100f;
                    Logger.LogInfo($"Map not found? Using default distance: {distanceLimit}");
                    return distanceLimit;
            }
        }
    }
}

using acidphantasm_botplacementsystem.Utils;
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

            if (wave.BossType != WildSpawnType.pmcBEAR && wave.BossType != WildSpawnType.pmcUSEC)
            {
                return true;
            }

            if (Utility.currentMapZones.Count == 0)
            {
                Utility.currentMapZones = wave.GetPossibleZones(__instance.botZone_0, __instance.botZone_0.ToList()).Where(x => !x.SnipeZone).ToList();
            }

            List<BotZone> botZones = Utility.GetMapBotZones();
            List<IPlayer> pmcList = Utility.GetAllPMCs();
            List<IPlayer> scavList = Utility.GetAllScavs();

            Logger.LogInfo($"Spawn Attempt: {creationData.Profiles[0].Nickname} | WildSpawnType: {wave.BossType} | Count: {1 + wave.EscortCount}");

            for (int i = 0; i < botZones.Count; i++)
            {
                BotZone botZone = botZones[i];

                int soloPointCount = 1;
                int escortPointCount = 1 + wave.EscortCount;

                string location = Utility.GetCurrentLocation() ?? "default";
                float distance = GetDistanceForMap(location);
                List<ISpawnPoint> validSpawnLocations = GetValidSpawnPoints(botZone, location, pmcList, scavList, distance, escortPointCount);
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

            Logger.LogInfo($"No valid spawnpoints outside defined distance, consider adjusting limits: {creationData.Profiles[0].Nickname} | WildSpawnType: {wave.BossType} | Count: {1 + wave.EscortCount}");

            return true;
        }
        private static List<ISpawnPoint> GetValidSpawnPoints(BotZone botZone, string location, IReadOnlyCollection<IPlayer> pmcPlayers, IReadOnlyCollection<IPlayer> scavPlayers, float distance, int neededPoints)
        {
            List<ISpawnPoint> validSpawnPoints = new List<ISpawnPoint>();
            location = location.ToLower();

            List<ISpawnPoint> list = botZone.SpawnPoints.ToList()
                .Where(x => !x.Categories.ContainBossCategory() || x.Categories == ESpawnCategoryMask.All)
                .ToList();

            list = list.OrderBy(_ => Guid.NewGuid()).ToList();

            bool foundInitialPoint = false;

            for (int i = 0; i < list.Count; i++)
            {
                ISpawnPoint checkPoint = list[i];
                if (!foundInitialPoint && IsValid(checkPoint, pmcPlayers, distance) && IsValid(checkPoint, scavPlayers, 25f))
                {
                    validSpawnPoints.Add(checkPoint);
                    foundInitialPoint = true;
                    neededPoints++;
                }
                if (foundInitialPoint && Vector3.Distance(checkPoint.Position, validSpawnPoints[0].Position) <= 15f)
                {
                    validSpawnPoints.Add(checkPoint);
                    neededPoints++;
                }
                if (validSpawnPoints.Count == neededPoints)
                {
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
            float distanceLimit = 50f;
            switch (mapName)
            {
                case "bigmap":
                    distanceLimit = customs_PMCSpawnDistanceCheck;
                    return distanceLimit;
                case "factory4_day":
                case "factory4_night":
                    distanceLimit = factory_PMCSpawnDistanceCheck;
                    return distanceLimit;
                case "interchange":
                    distanceLimit = interchange_PMCSpawnDistanceCheck;
                    return distanceLimit;
                case "laboratory":
                    distanceLimit = labs_PMCSpawnDistanceCheck;
                    return distanceLimit;
                case "lighthouse":
                    distanceLimit = lighthouse_PMCSpawnDistanceCheck;
                    return distanceLimit;
                case "rezervbase":
                    distanceLimit = reserve_PMCSpawnDistanceCheck;
                    return distanceLimit;
                case "sandbox":
                case "sandbox_high":
                    distanceLimit = groundZero_PMCSpawnDistanceCheck;
                    return distanceLimit;
                case "shoreline":
                    distanceLimit = shoreline_PMCSpawnDistanceCheck;
                    return distanceLimit;
                case "tarkovstreets":
                    distanceLimit = streets_PMCSpawnDistanceCheck;
                    return distanceLimit;
                case "woods":
                    distanceLimit = woods_PMCSpawnDistanceCheck;
                    return distanceLimit;
                default:
                    return distanceLimit;
            }
        }
    }
}

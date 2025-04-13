using acidphantasm_botplacementsystem.Spawning;
using EFT;
using HarmonyLib;
using SPT.Reflection.Patching;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using static acidphantasm_botplacementsystem.Spawning.BossSpawnTracking;

namespace acidphantasm_botplacementsystem.Patches
{
    internal class LocalGameProgressivePatch : ModulePatch
    {
        protected override MethodBase GetTargetMethod()
        {
            return AccessTools.Method(typeof(BossSpawnScenario), nameof(BossSpawnScenario.smethod_0));
        }

        [PatchPrefix]
        private static void PatchPrefix(BossLocationSpawn[] bossWaves, Action<BossLocationSpawn> spawnBossAction)
        {
            if (progressiveChances)
            {
                foreach (var wave in bossWaves)
                {
                    BossLocationSpawn currentBossSpawn = wave;
                    string bossName = currentBossSpawn.BossType.ToString();

                    if (!TrackedBosses.Contains(currentBossSpawn.BossType)) continue;

                    float chance = currentBossSpawn.BossChance;

                    if (BossInfoForProfile.ContainsKey(bossName))
                    {
                        int newChance = 0;
                        bool didBossSpawnLastRaid = BossInfoForProfile[bossName].spawnedLastRaid;

                        if (didBossSpawnLastRaid)
                        {
                            BossInfoForProfile[bossName].spawnedLastRaid = false;
                            newChance = minimumChance;
                        }
                        else
                        {
                            if (BossInfoForProfile[bossName].chance + chanceStep > maximumChance)
                            {
                                BossInfoForProfile[bossName].chance = maximumChance;
                                newChance = maximumChance;
                            }
                            else
                            {
                                BossInfoForProfile[bossName].chance += chanceStep;
                                newChance = BossInfoForProfile[bossName].chance;
                            }
                        }

                        chance = newChance;
                        Plugin.LogSource.LogInfo($"Setting chance to {newChance} for {bossName}");
                    }
                    else
                    {
                        Plugin.LogSource.LogInfo($"Setting chance to {minimumChance} for {bossName}");
                        CustomizedObject values = new CustomizedObject();
                        values.spawnedLastRaid = false;
                        values.chance = minimumChance;
                        BossInfoForProfile.Add(bossName, values);
                        chance = values.chance;
                    }
                }
            }
        }
    }
}

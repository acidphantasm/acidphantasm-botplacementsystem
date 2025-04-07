using Comfort.Common;
using EFT;
using HarmonyLib;
using SPT.Reflection.Patching;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace acidphantasm_botplacementsystem.Patches
{
    internal class NewSpawnAssaultGroupPatch : ModulePatch
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
            ref float ___float_2)
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

            int num = (__instance.BotMax - _softCap) - ___botsController_0.AliveLoadingDelayedBotsCount;
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
                    ___bool_0 = __instance.BotMax - ___botsController_0.AliveAndLoadingBotsCount <= 0;
                }
                return false;
            }
            num = ___gclass1647_0.TrySpawn(num, ___botsController_0, ___gclass1652_0);
            for (int i = 0; i < num; i++)
            {
                WildSpawnType wildSpawnType = ___gclass1652_1.Random();
                BotDifficulty botDifficulty = ___gclass1652_0.Random();
                GClass663 gclass = new GClass663(EPlayerSide.Savage, wildSpawnType, botDifficulty, 0f, null);
                ___botsController_0.ActivateBotsWithoutWave(1, gclass);
            }
            return false;
        }
    }
}

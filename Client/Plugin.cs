using acidphantasm_botplacementsystem.Patches;
using BepInEx;
using BepInEx.Logging;

namespace acidphantasm_botplacementsystem
{
    [BepInPlugin("com.acidphantasm.botplacementsystem", "acidphantasm-BotPlacementSystem", "1.0.0")]
    public class Plugin : BaseUnityPlugin
    {
        public static ManualLogSource LogSource;

        internal void Awake()
        {
            LogSource = Logger;
            
            //new OnGameStartedPatch().Enable();
            new PMCWaveCountPatch().Enable();
            new PMCDistancePatch().Enable();
            new NewSpawnAssaultGroupPatch().Enable();
            new NonWavesSpawnScenarioUpdatePatch().Enable();

            ABPSConfig.InitABPSConfig(Config);
        }
    }
}

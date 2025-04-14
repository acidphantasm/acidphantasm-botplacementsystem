using acidphantasm_botplacementsystem.Patches;
using BepInEx;
using BepInEx.Bootstrap;
using BepInEx.Logging;

namespace acidphantasm_botplacementsystem
{
    [BepInPlugin("com.acidphantasm.botplacementsystem", "acidphantasm-BotPlacementSystem", "1.0.1")]
    public class Plugin : BaseUnityPlugin
    {
        public static ManualLogSource LogSource;

        internal void Awake()
        {
            LogSource = Logger;

            //new OnGameStartedPatch().Enable();
            new UnregisterPlayerPatch().Enable();
            new MenuLoadPatch().Enable();

            new LocalGameProgressivePatch().Enable();
            new BossAddProgressionPatch().Enable();
            new PMCWaveCountPatch().Enable();
            new PMCDistancePatch().Enable();
            new AssaultGroupPatch().Enable();
            new NonWavesSpawnScenarioUpdatePatch().Enable();
            new TryToSpawnInZonePatch().Enable();
            
            ABPSConfig.InitABPSConfig(Config);
        }
    }
}

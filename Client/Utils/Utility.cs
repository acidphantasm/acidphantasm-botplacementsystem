﻿using Comfort.Common;
using EFT;
using EFT.Game.Spawning;
using SPT.Reflection.Utils;
using System;
using System.Collections.Generic;
using System.Linq;

namespace acidphantasm_botplacementsystem.Utils
{
    internal class Utility
    {
        public static string mainProfileID = string.Empty;
        public static string mapName = string.Empty;
        public static List<IPlayer> allPMCs = new List<IPlayer>();
        public static List<BotZone> currentMapZones = new List<BotZone>();

        public void Awake()
        {
            mainProfileID = GetPlayerProfile().ProfileId;
            Plugin.LogSource.LogInfo(mainProfileID);
        }
        public static Profile GetPlayerProfile()
        {
            return ClientAppUtils.GetClientApp().GetClientBackEndSession().Profile;
        }

        public static string GetCurrentLocation()
        {
            if (mapName != string.Empty) return mapName;

            var gameWorld = Singleton<GameWorld>.Instance;
            if (gameWorld != null)
            {
                mapName = gameWorld.MainPlayer.Location;
                return mapName;
            }
            return "default";
        }
        public static List<IPlayer> GetAllPMCs()
        {
            var gameWorld = Singleton<GameWorld>.Instance;
            if (gameWorld != null)
            {
                allPMCs = gameWorld.RegisteredPlayers
                    .Where(x => x.Profile.Side == EPlayerSide.Bear || x.Profile.Side == EPlayerSide.Usec)
                    .ToList();
                return allPMCs;
            }
            return new List<IPlayer>();
        }
        public static List<BotZone> GetMapBotZones()
        {
            List<BotZone> shuffledList = currentMapZones.OrderBy(_ => Guid.NewGuid()).ToList();
            return shuffledList;
        }
    }
}

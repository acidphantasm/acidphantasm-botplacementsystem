﻿using Comfort.Common;
using EFT;
using EFT.Game.Spawning;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using UnityEngine;

namespace acidphantasm_botplacementsystem.Spawning
{
    public class PMCSpawning : MonoBehaviour
    {
        public static BossSpawnerClass _bossSpawnerClass;
        public static BotSpawner _botSpawner;
        public static IBotCreator _iBotCreator;

        public static async Task StartSpawnPMCGroup(BotCreationDataClass creationData, BossLocationSpawn wave, BotSpawnParams spawnParams, int followersCount, BotZone botZone, List<ISpawnPoint> openedPositions, BossSpawnerClass bossSpawnerClass, BotSpawner botSpawner, IBotCreator botCreator)
        {
            _bossSpawnerClass = bossSpawnerClass;
            _botSpawner = botSpawner;
            _iBotCreator = botCreator;

            BossSpawnerClass.Class328 @class = new BossSpawnerClass.Class328();
            @class.bossSpawnerClass = _bossSpawnerClass;
            @class.creationData = creationData;
            @class.botZone = botZone;
            @class.followersCount = followersCount;
            @class.spawnParams = spawnParams;
            @class.wave = wave;
            @class.openedPositions = openedPositions;
            float time = @class.wave.Time;
            @class.spawnParams.ShallBeGroup = new ShallBeGroupParams(true, true, @class.followersCount + 1);
            GClass663 gclass = new GClass663(EPlayerSide.Savage, @class.wave.BossType, @class.wave.BossDif, time, @class.spawnParams);
            @class.side = EPlayerSide.Savage;
            bool flag = @class.wave.IsStartWave();
            ISpawnPoint spawnPoint = @class.openedPositions[0];
            @class.openedPositions.Remove(spawnPoint);
            @class.spawnProcessData = new BossSpawnerClass.Class326(@class.wave, @class.botZone);
            _bossSpawnerClass.list_0.Add(@class.spawnProcessData);

            if (flag)
            {
                if (_bossSpawnerClass.botSpawner_0.CanSpawnRole(gclass))
                {
                    await SpawnLeader(@class.creationData, spawnPoint, @class.botZone, @class.followersCount, gclass, new Action<BotOwner>(@class.method_0));
                    await SpawnFollowers(@class.creationData, @class.botZone, @class.followersCount, @class.spawnParams, @class.wave, @class.side, @class.openedPositions, true);
                }
            }
            else
            {
                await SpawnLeader(@class.creationData, spawnPoint, @class.botZone, @class.followersCount, gclass, new Action<BotOwner>(@class.method_1));
            }
        }
        
        public static async Task SpawnLeader(BotCreationDataClass creationData, ISpawnPoint point, BotZone ss, int followers, GClass663 data, Action<BotOwner> callback)
        {
            BossSpawnerClass.Class331 @class = new BossSpawnerClass.Class331();
            @class.data = data;
            @class.followers = followers;
            @class.callback = callback;
            List<ISpawnPoint> list = new List<ISpawnPoint> { point };
            SpawnBotsInZoneOnPositions(list, ss, creationData, new Action<BotOwner>(@class.method_0));
        }

        public static async Task SpawnFollowers(BotCreationDataClass bossCreationData, BotZone zone, int followersCount, BotSpawnParams spawnParams, BossLocationSpawn wave, EPlayerSide side, List<ISpawnPoint> pointsToSpawn, bool forceSpawn)
        {
            List<BossLocationSpawnSubData> escors = wave.GetEscors();
            if (escors != null)
            {
                GenerateFollowerData(bossCreationData, zone, side, wave, escors, spawnParams, pointsToSpawn, forceSpawn).HandleExceptions();
            }
            else if (followersCount > 0)
            {
                BotCreationDataClass botCreationDataClass = await BotCreationDataClass.Create(new GClass663(EPlayerSide.Savage, wave.EscortType, wave.EscortDif, wave.Time, spawnParams), _iBotCreator, followersCount, _botSpawner);
                TryToSpawnInZoneAndDelay(zone, botCreationDataClass, false, true, pointsToSpawn, forceSpawn);
            }
        }

        public static async Task GenerateFollowerData(BotCreationDataClass creationData, BotZone zone, EPlayerSide side, BossLocationSpawn wave, List<BossLocationSpawnSubData> escorts, BotSpawnParams spawnParams, List<ISpawnPoint> pointsToSpawn, bool forceSpawn)
        {
            if (wave.EscortCount > pointsToSpawn.Count)
            {
                pointsToSpawn = null;
            }
            foreach (BossLocationSpawnSubData bossLocationSpawnSubData in escorts)
            {
                List<ISpawnPoint> list = null;
                if (pointsToSpawn != null)
                {
                    list = new List<ISpawnPoint>();
                    for (int i = 0; i < bossLocationSpawnSubData.BossEscortAmount; i++)
                    {
                        if (pointsToSpawn.Count > 0)
                        {
                            ISpawnPoint spawnPoint = pointsToSpawn.First<ISpawnPoint>();
                            list.Add(spawnPoint);
                            pointsToSpawn.Remove(spawnPoint);
                        }
                    }
                    if (bossLocationSpawnSubData.BossEscortAmount != list.Count)
                    {
                        list = null;
                    }
                }
                BotCreationDataClass result = await BotCreationDataClass.Create(new GClass663(side, bossLocationSpawnSubData.BossEscortType, bossLocationSpawnSubData.EscortDifficulty, wave.Time, spawnParams), _iBotCreator, bossLocationSpawnSubData.BossEscortAmount, _botSpawner);
                TryToSpawnInZoneAndDelay(zone, result, false, true, list, forceSpawn);
                await Task.Yield();
                list = null;
            }
        }

        public static void SpawnBotsInZoneOnPositions(List<ISpawnPoint> openedPositions, BotZone botZone, BotCreationDataClass data, Action<BotOwner> callback = null)
        {
            AddSpawnPointDataAndSpawn(openedPositions, botZone, data, callback, _botSpawner._cancellationTokenSource.Token).HandleExceptions();
        }

        public static async Task AddSpawnPointDataAndSpawn(List<ISpawnPoint> spawnPoints, BotZone botZone, BotCreationDataClass data, Action<BotOwner> callback, CancellationToken cancellationToken)
        {
            _botSpawner._inSpawnProcess += spawnPoints.Count;
            if (!data.SpawnStopped)
            {
                int maxBots = _botSpawner.MaxBots;
                if (!cancellationToken.IsCancellationRequested)
                {
                    foreach (ISpawnPoint spawnPoint in spawnPoints)
                    {
                        var corePointID = Singleton<IBotGame>.Instance.BotsController.CoversData.GetClosest(spawnPoint.Position).CorePointInGame.Id;
                        data.AddPosition(spawnPoint.Position, corePointID);
                    }
                    spawnPoints.Clear();
                    SpawnBot(botZone, data, callback, cancellationToken);
                    await Task.Yield();
                }
            }
        }

        public static void TryToSpawnInZoneAndDelay(BotZone botZone, BotCreationDataClass data, bool withCheckMinMax, bool newWave, List<ISpawnPoint> pointsToSpawn = null, bool forcedSpawn = false)
        {
            if (data.SpawnStopped)
            {
                return;
            }
            GClass1655 gclass = TryToSpawnInZoneInner(botZone, data, data.Count, withCheckMinMax, newWave, pointsToSpawn, forcedSpawn);
            if (gclass != null)
            {
                _botSpawner.SpawnDelaysService.Add(gclass);
            }
        }

        public static GClass1655 TryToSpawnInZoneInner(BotZone botZone, BotCreationDataClass data, int count, bool withCheckMinMax, bool newWave, List<ISpawnPoint> pointsToSpawn = null, bool forcedSpawn = false)
        {
            if (data.SpawnStopped)
            {
                return null;
            }
            if (DebugBotData.UseDebugData && DebugBotData.Instance.spawnInstantly)
            {
                forcedSpawn = true;
            }
            if (!_botSpawner._botCreator.StartProfilesLoaded)
            {
                return new GClass1655(botZone, count, data, new Action<GClass1655>(_botSpawner.method_8));
            }
            if (DebugBotData.UseDebugData && DebugBotData.Instance.spawnInstantly)
            {
                ISpawnPoint[] array = _botSpawner._spawnSystem.SelectAISpawnPoints(ESpawnCategory.Bot, data, botZone, count, null, ActionIfNotEnoughPoints.DuplicateIfAtLeastOne);
                SpawnBotsInZoneOnPositions(array.ToList<ISpawnPoint>(), botZone, data, null);
                return new GClass1655(botZone, 0, data, new Action<GClass1655>(_botSpawner.method_8));
            }
            if (!data.CanAtZoneByType(botZone, _botSpawner.BotGame.BotsController.ZonesLeaveController))
            {
                return new GClass1655(botZone, count, data, new Action<GClass1655>(_botSpawner.method_8));
            }
            _botSpawner._bots.GetListByZone(botZone);
            bool flag = data.IsBossOrFollowerByTime();
            if (withCheckMinMax && !botZone.HaveFreeSpace(count) && !flag && !forcedSpawn)
            {
                return new GClass1655(botZone, count, data, new Action<GClass1655>(_botSpawner.method_8));
            }
            if (newWave)
            {
                Action<GClass1659> onSpawnedWave = (x) => new GClass1659(botZone, count, data);
                _botSpawner.OnSpawnedWave += onSpawnedWave;
            }
            int num;
            int num2;
            if (withCheckMinMax && !forcedSpawn)
            {
                _botSpawner.CheckOnMax(count, out num, out num2, false);
            }
            else
            {
                num = 0;
                num2 = count;
            }
            if (num > 0)
            {
                return new GClass1655(botZone, num, data, new Action<GClass1655>(_botSpawner.method_8));
            }
            if (num2 > 0)
            {
                if (flag)
                {
                    data.IsSpawnOnStart();
                }
                count = num2;
                ISpawnPoint[] array2;
                if (pointsToSpawn != null)
                {
                    array2 = pointsToSpawn.ToArray();
                }
                else
                {
                    array2 = _botSpawner._spawnSystem.SelectAISpawnPoints(ESpawnCategory.Bot, data, botZone, count, null, ActionIfNotEnoughPoints.DuplicateIfAtLeastOne);
                    if (count > array2.Length)
                    {
                        if (!forcedSpawn)
                        {
                            int num3 = count - array2.Length;
                            return new GClass1655(botZone, num3, data, new Action<GClass1655>(_botSpawner.method_8));
                        }
                        array2 = _botSpawner._spawnSystem.SelectAISpawnPoints(ESpawnCategory.Bot, data, botZone, count, null, ActionIfNotEnoughPoints.ReturnFoundPoints);
                    }
                }
                SpawnBotsInZoneOnPositions(array2.ToList<ISpawnPoint>(), botZone, data, null);
            }
            return null;
        }
        public static void SpawnBot(BotZone zone, BotCreationDataClass data, Action<BotOwner> callback, CancellationToken cancellationToken)
        {
            BotSpawner.Class1053 @class = new BotSpawner.Class1053();
            @class.botSpawner_0 = _botSpawner;
            @class.data = data;
            @class.callback = callback;
            if (_botSpawner._gameEnd)
            {
                return;
            }
            if (@class.data.SpawnStopped)
            {
                _botSpawner._inSpawnProcess--;
                return;
            }
            @class.stopWatch = new Stopwatch();
            @class.stopWatch.Start();
            @class.shallBeGroup = @class.data.SpawnParams != null && @class.data.SpawnParams.ShallBeGroup != null && @class.data.SpawnParams.ShallBeGroup.Group && @class.data.SpawnParams.ShallBeGroup.RemainCount > 0;
            if (@class.shallBeGroup)
            {
                @class.data.SpawnParams.ShallBeGroup.DescreaseCount();
            }
            _botSpawner._botCreator.ActivateBot(@class.data, zone, @class.shallBeGroup, new Func<BotOwner, BotZone, BotsGroup>(_botSpawner.GetGroupAndSetEnemies), new Action<BotOwner>(@class.method_0), cancellationToken);
        }
    }
}

import { inject, injectable } from "tsyringe";
import { StaticRouterModService } from "@spt/services/mod/staticRouter/StaticRouterModService";
import { MapSpawnControl } from "../Controls/MapSpawnControl";
import path from "node:path";
import { FileSystemSync } from "@spt/utils/FileSystemSync";

@injectable()
export class StaticRouterHooks
{
    public cacheRebuilt: boolean = false;
    public mapToRebuild: string = "";
    public bossTrackingData: BossTrackingData = null;
    
    constructor(
        @inject("StaticRouterModService") protected staticRouterService: StaticRouterModService,
        @inject("MapSpawnControl") protected mapSpawnControl: MapSpawnControl,
        @inject("FileSystemSync") protected fileSystem: FileSystemSync
    )
    {}

    public registerRouterHooks(): void
    {

        this.staticRouterService.registerStaticRouter(
            "ABPS-StartMatchRouter",
            [
                {
                    url: "/client/match/local/start",
                    action: async (url, info, sessionId, output) => 
                    {
                        this.mapToRebuild = info.location;
                        if (this.cacheRebuilt)
                        {
                            this.cacheRebuilt = false;
                        }
                        return output;
                    }
                }
            ],
            "ABPS"
        );

        this.staticRouterService.registerStaticRouter(
            "ABPS-EndMatchRouter",
            [
                {
                    url: "/client/match/local/end",
                    action: async (url, info, sessionId, output) => 
                    {
                        if (!this.cacheRebuilt)
                        {
                            this.mapSpawnControl.configureInitialData();
                            //this.mapSpawnControl.rebuildCache(this.mapToRebuild);
                            this.cacheRebuilt = true;
                        }
                        return output;
                    }
                }
            ],
            "ABPS"
        );

        this.staticRouterService.registerStaticRouter(
            "ABPS-BossTrackingRoutes",
            [
                {
                    url: "/abps/save",
                    action: async (url, info: BossTrackingData, sessionId, output) => this.saveBossTrackingData(info)
                },
                {
                    url: "/abps/load",
                    action: async (url, info, sessionId, output) => JSON.stringify(this.bossTrackingData)
                }
            ],
            "ABPS"
        );

        this.load();
    }

    private async saveBossTrackingData(payload: BossTrackingData): Promise<string> 
    {
        if (!payload) 
        {
            return;
        }
        else 
        {
            this.bossTrackingData = payload;
        }

        await this.save();
        return JSON.stringify({ success: true });
    }

    private async save(): Promise<void>
    {
        try 
        {
            const filename = path.join(__dirname, "../../bossTrackingData.json");
            await this.fileSystem.writeJson(filename, this.bossTrackingData, 2);
        }
        catch (error) 
        {
            console.error("[ABPS] Failed to save boss tracking data! " + error);
        }
    }

    public async load(): Promise<void>
    {
        const filename = path.join(__dirname,  "../../bossTrackingData.json");
        if (this.fileSystem.exists(filename)) 
        {
            const jsonData = this.fileSystem.readJson(filename);
            this.bossTrackingData = jsonData;
        }
        else 
        {
            this.bossTrackingData = {};
            await this.save();
        }
    }
}

type BossTrackingInfo = {
    spawnedLastRaid: boolean,
    chance: number,
};

type BossTrackingData = Record<string, Record<string, BossTrackingInfo>>;
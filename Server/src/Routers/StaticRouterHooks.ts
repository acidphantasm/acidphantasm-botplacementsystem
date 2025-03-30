import { inject, injectable } from "tsyringe";
import { StaticRouterModService } from "@spt/services/mod/staticRouter/StaticRouterModService";
import { MapSpawnControl } from "../Controls/MapSpawnControl";

@injectable()
export class StaticRouterHooks
{
    public cacheRebuilt: boolean = false;
    public mapToRebuild: string = "";
    
    constructor(
        @inject("StaticRouterModService") protected staticRouterService: StaticRouterModService,
        @inject("MapSpawnControl") protected mapSpawnControl: MapSpawnControl
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
                            this.mapSpawnControl.rebuildCache(this.mapToRebuild);
                            this.cacheRebuilt = true;
                        }
                        return output;
                    }
                }
            ],
            "ABPS"
        );
    }
}
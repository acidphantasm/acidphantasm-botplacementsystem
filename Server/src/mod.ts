import { DependencyContainer } from "tsyringe";
import { IPreSptLoadMod } from "@spt/models/external/IPreSptLoadMod";
import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { InstanceManager } from "./InstanceManager";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";
import { ICoreConfig } from "@spt/models/spt/config/ICoreConfig";
import { ConfigServer } from "@spt/servers/ConfigServer";
import { FileSystemSync } from "@spt/utils/FileSystemSync";

import { minVersion, satisfies, SemVer } from "semver";
import path from "node:path";

import { ILocationBase } from "@spt/models/eft/common/ILocationBase";
import { IRaidChanges } from "@spt/models/spt/location/IRaidChanges";


class ABPS implements IPreSptLoadMod, IPostDBLoadMod
{
    // Create InstanceManager - Thank you Cj as per usual
    private instance: InstanceManager = new InstanceManager();
    
    // PreSPTLoad
    public preSptLoad(container: DependencyContainer): void 
    {
        const logger = container.resolve<ILogger>("WinstonLogger");
        if (!this.validSptVersion(container)) 
        {
            logger.error(`[ABPS] This version of ABPS was not made for your version of SPT. Disabling. Requires ${this.validMinimumSptVersion(container)} or higher.`);
            return;
        }

        this.instance.preSptLoad(container, "ABPS");
        this.instance.staticRouterHooks.registerRouterHooks();

        container.afterResolution("RaidTimeAdjustmentService", (_t, result: any) =>
        {
            result.adjustWaves = (mapBase: ILocationBase, raidAdjustments: IRaidChanges) =>
            {
                this.instance.mapSpawnControl.adjustWaves(mapBase, raidAdjustments);
            }
        }, {frequency: "Always"});
    }

    // PostDBLoad
    public postDBLoad(container: DependencyContainer): void 
    {
        this.instance.postDBLoad(container);
        this.instance.mapSpawnControl.configureInitialData();
    }
    
    // Version Validation
    public validSptVersion(container: DependencyContainer): boolean
    {
        const fileSysem = container.resolve<FileSystemSync>("FileSystemSync");
        const configServer = container.resolve<ConfigServer>("ConfigServer");
        const sptConfig = configServer.getConfig<ICoreConfig>(ConfigTypes.CORE);
        
        const sptVersion = globalThis.G_SPTVERSION || sptConfig.sptVersion;
        const packageJsonPath: string = path.join(__dirname, "../package.json");
        const modSptVersion = fileSysem.readJson(packageJsonPath).sptVersion;

        return satisfies(sptVersion, modSptVersion);
    }

    public validMinimumSptVersion(container: DependencyContainer): SemVer
    {
        const fileSysem = container.resolve<FileSystemSync>("FileSystemSync");
        const packageJsonPath: string = path.join(__dirname, "../package.json");
        const modSptVersion = fileSysem.readJson(packageJsonPath).sptVersion;

        return minVersion(modSptVersion)
    }
}

export const mod = new ABPS();

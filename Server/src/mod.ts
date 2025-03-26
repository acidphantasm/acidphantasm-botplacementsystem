import { DependencyContainer } from "tsyringe";
import { IPreSptLoadMod } from "@spt/models/external/IPreSptLoadMod";
import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { IPostSptLoadMod } from "@spt/models/external/IPostSptLoadMod";
import { InstanceManager } from "./InstanceManager";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";
import { ICoreConfig } from "@spt/models/spt/config/ICoreConfig";
import { ConfigServer } from "@spt/servers/ConfigServer";
import { FileSystemSync } from "@spt/utils/FileSystemSync";

import { minVersion, satisfies, SemVer } from "semver";
import path from "node:path";


class ABPS implements IPreSptLoadMod, IPostDBLoadMod, IPostSptLoadMod
{
    // Create InstanceManager - Thank you Cj as per usual
    private instance: InstanceManager = new InstanceManager();
    
    // PreSPTLoad
    public preSptLoad(container: DependencyContainer): void 
    {
        const logger = container.resolve<ILogger>("WinstonLogger");
        if (!this.validSptVersion(container)) 
        {
            logger.error(`[APBS] This version of APBS was not made for your version of SPT. Disabling. Requires ${this.validMinimumSptVersion(container)} or higher.`);
            return;
        }

        this.instance.preSptLoad(container, "APBS");
    }

    // PostDBLoad
    public postDBLoad(container: DependencyContainer): void 
    {
        this.instance.postDBLoad(container);
    }

    // PostSPTLoad
    public postSptLoad(container: DependencyContainer): void 
    {
        this.instance.postSptLoad(container);
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

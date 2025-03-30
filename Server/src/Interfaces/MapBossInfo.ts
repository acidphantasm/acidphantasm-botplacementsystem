import { MinMax } from "@spt/models/common/MinMax"
import { IBossLocationSpawn } from "@spt/models/eft/common/ILocationBase";

export interface LocationInformation {
    locations: Record<string, IBossLocationSpawn>
}
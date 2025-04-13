import { ExhaustableArray } from "@spt/models/spt/server/ExhaustableArray";
import { ICloner } from "@spt/utils/cloners/ICloner";
import { RandomUtil } from "@spt/utils/RandomUtil";

export function createExhaustableArray<T>(itemsToAddToArray: T[], randomUtil: RandomUtil, cloner: ICloner): ExhaustableArray<T>
{
    return new ExhaustableArray<T>(itemsToAddToArray, randomUtil, cloner);
}
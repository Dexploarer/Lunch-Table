import type {
  DataModelFromSchemaDefinition,
  GenericMutationCtx,
  GenericQueryCtx,
} from "convex/server";
import type { GenericId } from "convex/values";

import type schema from "../schema";

export type LunchTableDataModel = DataModelFromSchemaDefinition<typeof schema>;
export type MutationCtx = GenericMutationCtx<LunchTableDataModel>;
export type QueryCtx = GenericQueryCtx<LunchTableDataModel>;

export type UserId = GenericId<"users">;
export type WalletId = GenericId<"wallets">;
